import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DB_FILE = path.join(__dirname, 'salon_db.json');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});

app.use(cors());
app.use(express.json());

// Initial default state
const defaultServices = [
  { id: 'srv-1', nameEn: 'Haircut & Styling', nameGu: 'હેરકટ અને સ્ટાઇલિંગ', duration: 30, price: 150, active: true, category: 'Hair' },
  { id: 'srv-2', nameEn: 'Beard Trim & Shape', nameGu: 'દાઢી ટ્રીમ અને શેપ', duration: 15, price: 80, active: true, category: 'Beard' },
  { id: 'srv-3', nameEn: 'Royal Hair Spa', nameGu: 'રોયલ હેર સ્પા', duration: 45, price: 400, active: true, category: 'Spa' },
  { id: 'srv-4', nameEn: 'Classic Shave', nameGu: 'ક્લાસિક શેવ', duration: 20, price: 100, active: true, category: 'Beard' },
  { id: 'srv-5', nameEn: 'Face D-Tan & Massage', nameGu: 'ફેસ ડી-ટેન અને મસાજ', duration: 25, price: 250, active: true, category: 'Spa' },
  { id: 'srv-6', nameEn: 'Hair Color & Highlights', nameGu: 'હેર કલર અને હાઇલાઇટ્સ', duration: 40, price: 350, active: true, category: 'Color' }
];

const defaultBarbers = [
  { id: 'barber-1', name: 'Ravi', photo: '👨‍🦱', status: 'free', onDuty: true, currentTicketId: null },
  { id: 'barber-2', name: 'Amit', photo: '🧔', status: 'free', onDuty: true, currentTicketId: null },
  { id: 'barber-3', name: 'Imran', photo: '💈', status: 'free', onDuty: true, currentTicketId: null }
];

let salonState = {
  isQueueOpen: true,
  barbers: defaultBarbers,
  services: defaultServices,
  tickets: [],
  tokenCounter: 1,
  todayStats: {
    customersServed: 0,
    noShows: 0,
    totalWaitTimeMinutes: 0
  }
};

// Persistence helper
function saveState() {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(salonState, null, 2));
  } catch (err) {
    console.error('Failed to save state to disk:', err);
  }
}

function loadState() {
  try {
    if (fs.existsSync(DB_FILE)) {
      const data = fs.readFileSync(DB_FILE, 'utf8');
      salonState = JSON.parse(data);
    }
  } catch (err) {
    console.warn('Initializing default state:', err.message);
  }
}

loadState();

// Broadcast state to all connected clients
function broadcastState(alertEvent = null) {
  saveState();
  io.emit('stateChange', { state: salonState, alertEvent });
}

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', time: new Date().toISOString() });
});

// Fetch current state
app.get('/api/state', (req, res) => {
  res.json(salonState);
});

// Join queue endpoint
app.post('/api/queue/join', (req, res) => {
  const { customerName, phone, serviceIds, preferredBarberId } = req.body;

  if (!customerName || customerName.trim().length < 2) {
    return res.status(400).json({ error: 'Customer name is required' });
  }

  // 10-digit Indian phone regex
  if (!phone || !/^[6-9]\d{9}$/.test(phone)) {
    return res.status(400).json({ error: 'Valid 10-digit mobile number required' });
  }

  if (!serviceIds || !Array.isArray(serviceIds) || serviceIds.length === 0 || serviceIds.length > 3) {
    return res.status(400).json({ error: 'Please select 1 to 3 services' });
  }

  if (!salonState.isQueueOpen) {
    return res.status(403).json({ error: 'Online queue is closed. Only salon walk-ins allowed.' });
  }

  // Check if phone already has an active ticket
  const existingActive = salonState.tickets.find(
    t => t.phone === phone && (t.status === 'Waiting' || t.status === 'Called' || t.status === 'In chair')
  );

  if (existingActive) {
    return res.status(200).json({
      message: 'Active spot already exists',
      ticket: existingActive,
      isExisting: true
    });
  }

  const selectedServices = salonState.services.filter(s => serviceIds.includes(s.id) && s.active);
  if (selectedServices.length === 0) {
    return res.status(400).json({ error: 'Selected services are not available' });
  }

  const totalDuration = selectedServices.reduce((acc, s) => acc + s.duration, 0);
  const totalPrice = selectedServices.reduce((acc, s) => acc + s.price, 0);

  let preferredBarberName = 'Any barber';
  if (preferredBarberId !== 'any') {
    const b = salonState.barbers.find(barber => barber.id === preferredBarberId);
    if (b) preferredBarberName = b.name;
  }

  const tokenNumber = `S-${salonState.tokenCounter++}`;
  const newTicket = {
    id: 'tkt-' + Date.now() + '-' + Math.random().toString(36).substring(2, 7),
    token: tokenNumber,
    customerName: customerName.trim(),
    phone,
    services: selectedServices,
    preferredBarberId: preferredBarberId || 'any',
    preferredBarberName,
    assignedBarberId: null,
    assignedBarberName: null,
    status: 'Waiting',
    createdAt: Date.now(),
    calledAt: null,
    startedAt: null,
    completedAt: null,
    totalDuration,
    totalPrice
  };

  salonState.tickets.push(newTicket);
  broadcastState({ type: 'NEW_TICKET', token: newTicket.token, name: newTicket.customerName });

  res.status(201).json({ ticket: newTicket, isExisting: false });
});

// Call Next for a Barber
app.post('/api/queue/call-next', (req, res) => {
  const { barberId } = req.body;
  const barber = salonState.barbers.find(b => b.id === barberId);

  if (!barber) {
    return res.status(404).json({ error: 'Barber not found' });
  }

  if (barber.status === 'busy') {
    return res.status(400).json({ error: 'Barber already has a customer in chair' });
  }

  // Find next customer according to FIFO & Barber preferences
  const nextTicket = salonState.tickets.find(
    t => t.status === 'Waiting' && (t.preferredBarberId === 'any' || t.preferredBarberId === barberId)
  );

  if (!nextTicket) {
    return res.status(404).json({ error: 'No waiting customer matches this barber' });
  }

  nextTicket.status = 'Called';
  nextTicket.assignedBarberId = barber.id;
  nextTicket.assignedBarberName = barber.name;
  nextTicket.calledAt = Date.now();

  barber.currentTicketId = nextTicket.id;

  broadcastState({
    type: 'CALLED',
    token: nextTicket.token,
    customerName: nextTicket.customerName,
    barberName: barber.name,
    ticketId: nextTicket.id
  });

  res.json({ success: true, ticket: nextTicket, barber });
});

// Update ticket status (Start / Done / Cancel / No-show)
app.post('/api/queue/status', (req, res) => {
  const { ticketId, status } = req.body;
  const ticket = salonState.tickets.find(t => t.id === ticketId);

  if (!ticket) {
    return res.status(404).json({ error: 'Ticket not found' });
  }

  // Validate forward-only transitions
  if (status === 'In chair') {
    if (ticket.status !== 'Called') return res.status(400).json({ error: 'Cannot start unless Called' });
    ticket.status = 'In chair';
    ticket.startedAt = Date.now();

    const barber = salonState.barbers.find(b => b.id === ticket.assignedBarberId);
    if (barber) {
      barber.status = 'busy';
      barber.currentTicketId = ticket.id;
    }
  } else if (status === 'Done') {
    if (ticket.status !== 'In chair' && ticket.status !== 'Called') {
      return res.status(400).json({ error: 'Invalid transition to Done' });
    }
    ticket.status = 'Done';
    ticket.completedAt = Date.now();

    const barber = salonState.barbers.find(b => b.id === ticket.assignedBarberId);
    if (barber) {
      barber.status = 'free';
      barber.currentTicketId = null;
    }

    salonState.todayStats.customersServed += 1;
    const waitMins = Math.round((ticket.completedAt - ticket.createdAt) / 60000);
    salonState.todayStats.totalWaitTimeMinutes += waitMins;
  } else if (status === 'Cancelled') {
    if (ticket.status !== 'Waiting') return res.status(400).json({ error: 'Can only cancel while Waiting' });
    ticket.status = 'Cancelled';
  } else if (status === 'No-show') {
    if (ticket.status !== 'Called') return res.status(400).json({ error: 'Can only mark No-show when Called' });
    ticket.status = 'No-show';

    const barber = salonState.barbers.find(b => b.id === ticket.assignedBarberId);
    if (barber) {
      barber.status = 'free';
      barber.currentTicketId = null;
    }
    salonState.todayStats.noShows += 1;
  } else {
    return res.status(400).json({ error: 'Invalid target status' });
  }

  broadcastState({ type: 'STATUS_UPDATE', ticketId: ticket.id, status, token: ticket.token });
  res.json({ success: true, ticket });
});

// Barber break toggle
app.post('/api/barber/break', (req, res) => {
  const { barberId } = req.body;
  const barber = salonState.barbers.find(b => b.id === barberId);
  if (!barber) return res.status(404).json({ error: 'Barber not found' });

  if (barber.status === 'break') {
    barber.status = 'free';
  } else if (barber.status === 'free') {
    barber.status = 'break';
  } else {
    return res.status(400).json({ error: 'Cannot go on break while serving a customer' });
  }

  broadcastState();
  res.json({ success: true, barber });
});

// Admin: Toggle Service
app.post('/api/admin/service', (req, res) => {
  const { serviceId, active, price, duration } = req.body;
  const srv = salonState.services.find(s => s.id === serviceId);
  if (!srv) return res.status(404).json({ error: 'Service not found' });

  if (active !== undefined) srv.active = active;
  if (price !== undefined) srv.price = Number(price);
  if (duration !== undefined) srv.duration = Number(duration);

  broadcastState();
  res.json({ success: true, service: srv });
});

// Admin: Toggle Barber On Duty
app.post('/api/admin/barber-duty', (req, res) => {
  const { barberId, onDuty } = req.body;
  const barber = salonState.barbers.find(b => b.id === barberId);
  if (!barber) return res.status(404).json({ error: 'Barber not found' });

  barber.onDuty = onDuty;
  if (!onDuty && barber.status === 'free') {
    barber.status = 'break';
  } else if (onDuty && barber.status === 'break') {
    barber.status = 'free';
  }

  broadcastState();
  res.json({ success: true, barber });
});

// Admin: Toggle Queue
app.post('/api/admin/toggle-queue', (req, res) => {
  const { isQueueOpen } = req.body;
  salonState.isQueueOpen = isQueueOpen;
  broadcastState();
  res.json({ success: true, isQueueOpen: salonState.isQueueOpen });
});

// Admin: Reset Daily Queue
app.post('/api/admin/reset', (req, res) => {
  salonState.tickets = [];
  salonState.tokenCounter = 1;
  salonState.barbers.forEach(b => {
    b.status = 'free';
    b.currentTicketId = null;
  });
  salonState.todayStats = {
    customersServed: 0,
    noShows: 0,
    totalWaitTimeMinutes: 0
  };
  broadcastState({ type: 'RESET' });
  res.json({ success: true, message: 'Queue reset for the day' });
});

// Serve frontend build if available (for unified single-service hosting on Render / Railway)
const clientBuildPath = path.join(__dirname, '../client/dist');
if (fs.existsSync(clientBuildPath)) {
  app.use(express.static(clientBuildPath));
  app.get('*', (req, res) => {
    res.sendFile(path.join(clientBuildPath, 'index.html'));
  });
}

const PORT = process.env.PORT || 4000;
server.listen(PORT, () => {
  console.log(`Salon Queue Server listening on http://localhost:${PORT}`);
});
