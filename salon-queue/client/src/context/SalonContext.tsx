import React, { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import { io, Socket } from 'socket.io-client';
import type { SalonState, QueueTicket, Barber, ServiceItem } from '../types';
import { translations } from '../i18n';
import type { Language } from '../i18n';
import { playChime } from '../utils/sound';

interface SalonContextType {
  state: SalonState;
  language: Language;
  setLanguage: (lang: Language) => void;
  t: typeof translations['en'];
  joinQueue: (name: string, phone: string, serviceIds: string[], barberId: string) => Promise<{ ticket: QueueTicket; isExisting: boolean }>;
  callNext: (barberId: string) => Promise<{ success: boolean; error?: string }>;
  updateStatus: (ticketId: string, status: string) => Promise<{ success: boolean; error?: string }>;
  toggleBarberBreak: (barberId: string) => Promise<{ success: boolean }>;
  updateService: (serviceId: string, updates: Partial<ServiceItem>) => Promise<void>;
  toggleBarberDuty: (barberId: string, onDuty: boolean) => Promise<void>;
  toggleQueue: (open: boolean) => Promise<void>;
  resetDailyQueue: () => Promise<void>;
  activeAlert: { type: string; token: string; customerName?: string; barberName?: string } | null;
  clearAlert: () => void;
  isConnected: boolean;
}

const defaultServices: ServiceItem[] = [
  { id: 'srv-1', nameEn: 'Haircut & Styling', nameGu: 'હેરકટ અને સ્ટાઇલિંગ', duration: 30, price: 150, active: true, category: 'Hair' },
  { id: 'srv-2', nameEn: 'Beard Trim & Shape', nameGu: 'દાઢી ટ્રીમ અને શેપ', duration: 15, price: 80, active: true, category: 'Beard' },
  { id: 'srv-3', nameEn: 'Royal Hair Spa', nameGu: 'રોયલ હેર સ્પા', duration: 45, price: 400, active: true, category: 'Spa' },
  { id: 'srv-4', nameEn: 'Classic Shave', nameGu: 'ક્લાસિક શેવ', duration: 20, price: 100, active: true, category: 'Beard' },
  { id: 'srv-5', nameEn: 'Face D-Tan & Massage', nameGu: 'ફેસ ડી-ટેન અને મસાજ', duration: 25, price: 250, active: true, category: 'Spa' },
  { id: 'srv-6', nameEn: 'Hair Color & Highlights', nameGu: 'હેર કલર અને હાઇલાઇટ્સ', duration: 40, price: 350, active: true, category: 'Color' }
];

const defaultBarbers: Barber[] = [
  { id: 'barber-1', name: 'Ravi', photo: '👨‍🦱', status: 'free', onDuty: true, currentTicketId: null },
  { id: 'barber-2', name: 'Amit', photo: '🧔', status: 'free', onDuty: true, currentTicketId: null },
  { id: 'barber-3', name: 'Imran', photo: '💈', status: 'free', onDuty: true, currentTicketId: null }
];

const initialState: SalonState = {
  isQueueOpen: true,
  barbers: defaultBarbers,
  services: defaultServices,
  tickets: [],
  todayStats: {
    customersServed: 0,
    noShows: 0,
    totalWaitTimeMinutes: 0
  }
};

const SalonContext = createContext<SalonContextType | undefined>(undefined);

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:4000';

export const SalonProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>(() => {
    return (localStorage.getItem('salon_lang') as Language) || 'en';
  });

  const [state, setState] = useState<SalonState>(() => {
    const saved = localStorage.getItem('salon_state_cache');
    return saved ? JSON.parse(saved) : initialState;
  });

  const [activeAlert, setActiveAlert] = useState<{ type: string; token: string; customerName?: string; barberName?: string } | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem('salon_lang', lang);
  };

  const t = translations[language];

  // Initialize Socket.io connection
  useEffect(() => {
    let s: Socket | null = null;
    try {
      s = io(BACKEND_URL, {
        transports: ['websocket', 'polling'],
        timeout: 5000,
        reconnectionAttempts: 5
      });

      s.on('connect', () => {
        setIsConnected(true);
      });

      s.on('disconnect', () => {
        setIsConnected(false);
      });

      s.on('stateChange', (payload: { state: SalonState; alertEvent?: any }) => {
        if (payload?.state) {
          setState(payload.state);
          localStorage.setItem('salon_state_cache', JSON.stringify(payload.state));
        }
        if (payload?.alertEvent?.type === 'CALLED') {
          setActiveAlert(payload.alertEvent);
          playChime();
        }
      });
    } catch (err) {
      console.warn('Socket connection error, running in local fallback:', err);
    }

    // Fetch initial state from REST API
    fetch(`${BACKEND_URL}/api/state`)
      .then(res => res.json())
      .then(data => {
        if (data && data.barbers) {
          setState(data);
          localStorage.setItem('salon_state_cache', JSON.stringify(data));
        }
      })
      .catch(() => {
        console.log('Backend not reachable yet, loaded from local cache');
      });

    // Local BroadcastChannel for instant multi-tab sync even without server
    const bc = new BroadcastChannel('salon_queue_channel');
    bc.onmessage = (event) => {
      if (event.data?.state) {
        setState(event.data.state);
      }
      if (event.data?.alertEvent?.type === 'CALLED') {
        setActiveAlert(event.data.alertEvent);
        playChime();
      }
    };

    return () => {
      s?.disconnect();
      bc.close();
    };
  }, []);

  const clearAlert = () => setActiveAlert(null);

  // Sync state helper
  const syncLocal = (newState: SalonState, alertEvent: any = null) => {
    setState(newState);
    localStorage.setItem('salon_state_cache', JSON.stringify(newState));
    const bc = new BroadcastChannel('salon_queue_channel');
    bc.postMessage({ state: newState, alertEvent });
    bc.close();
  };

  // Join Queue
  const joinQueue = async (customerName: string, phone: string, serviceIds: string[], barberId: string) => {
    try {
      const res = await fetch(`${BACKEND_URL}/api/queue/join`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ customerName, phone, serviceIds, preferredBarberId: barberId })
      });
      if (res.ok) {
        const data = await res.json();
        return { ticket: data.ticket, isExisting: data.isExisting };
      }
      const err = await res.json();
      throw new Error(err.error || 'Failed to join');
    } catch {
      // Local fallback
      const existing = state.tickets.find(t => t.phone === phone && (t.status === 'Waiting' || t.status === 'Called' || t.status === 'In chair'));
      if (existing) {
        return { ticket: existing, isExisting: true };
      }

      const selectedServices = state.services.filter(s => serviceIds.includes(s.id));
      const totalDuration = selectedServices.reduce((acc, s) => acc + s.duration, 0);
      const totalPrice = selectedServices.reduce((acc, s) => acc + s.price, 0);

      const barber = state.barbers.find(b => b.id === barberId);
      const token = `S-${state.tickets.length + 1}`;
      const newTicket: QueueTicket = {
        id: 'tkt-' + Date.now(),
        token,
        customerName,
        phone,
        services: selectedServices,
        preferredBarberId: barberId,
        preferredBarberName: barber ? barber.name : 'Any barber',
        status: 'Waiting',
        createdAt: Date.now(),
        totalDuration,
        totalPrice
      };

      const newState = {
        ...state,
        tickets: [...state.tickets, newTicket]
      };
      syncLocal(newState);
      return { ticket: newTicket, isExisting: false };
    }
  };

  // Call Next
  const callNext = async (barberId: string) => {
    try {
      const res = await fetch(`${BACKEND_URL}/api/queue/call-next`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ barberId })
      });
      if (!res.ok) {
        const err = await res.json();
        return { success: false, error: err.error };
      }
      return { success: true };
    } catch {
      // Local fallback
      const barber = state.barbers.find(b => b.id === barberId);
      if (!barber || barber.status === 'busy') return { success: false, error: 'Barber busy' };

      const nextTicket = state.tickets.find(
        t => t.status === 'Waiting' && (t.preferredBarberId === 'any' || t.preferredBarberId === barberId)
      );
      if (!nextTicket) return { success: false, error: 'No matching customer' };

      const updatedTickets = state.tickets.map(t => {
        if (t.id === nextTicket.id) {
          return {
            ...t,
            status: 'Called' as const,
            assignedBarberId: barber.id,
            assignedBarberName: barber.name,
            calledAt: Date.now()
          };
        }
        return t;
      });

      const updatedBarbers = state.barbers.map(b => {
        if (b.id === barber.id) {
          return { ...b, currentTicketId: nextTicket.id };
        }
        return b;
      });

      const newState = { ...state, tickets: updatedTickets, barbers: updatedBarbers };
      const alertEvent = { type: 'CALLED', token: nextTicket.token, customerName: nextTicket.customerName, barberName: barber.name, ticketId: nextTicket.id };
      syncLocal(newState, alertEvent);
      setActiveAlert(alertEvent);
      playChime();

      return { success: true };
    }
  };

  // Update Status
  const updateStatus = async (ticketId: string, status: string) => {
    try {
      const res = await fetch(`${BACKEND_URL}/api/queue/status`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ticketId, status })
      });
      if (!res.ok) {
        const err = await res.json();
        return { success: false, error: err.error };
      }
      return { success: true };
    } catch {
      // Local fallback
      const ticket = state.tickets.find(t => t.id === ticketId);
      if (!ticket) return { success: false, error: 'Not found' };

      const updatedTickets = state.tickets.map(t => {
        if (t.id === ticketId) {
          return {
            ...t,
            status: status as any,
            startedAt: status === 'In chair' ? Date.now() : t.startedAt,
            completedAt: status === 'Done' ? Date.now() : t.completedAt
          };
        }
        return t;
      });

      const updatedBarbers = state.barbers.map(b => {
        if (b.id === ticket.assignedBarberId) {
          if (status === 'In chair') return { ...b, status: 'busy' as const };
          if (status === 'Done' || status === 'No-show') return { ...b, status: 'free' as const, currentTicketId: null };
        }
        return b;
      });

      const newStats = { ...state.todayStats };
      if (status === 'Done') newStats.customersServed += 1;
      if (status === 'No-show') newStats.noShows += 1;

      const newState = { ...state, tickets: updatedTickets, barbers: updatedBarbers, todayStats: newStats };
      syncLocal(newState);
      return { success: true };
    }
  };

  // Toggle Barber Break
  const toggleBarberBreak = async (barberId: string) => {
    try {
      const res = await fetch(`${BACKEND_URL}/api/barber/break`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ barberId })
      });
      if (res.ok) return { success: true };
    } catch {}

    const updatedBarbers = state.barbers.map(b => {
      if (b.id === barberId) {
        const newStatus = b.status === 'break' ? 'free' : 'break';
        return { ...b, status: newStatus as any };
      }
      return b;
    });
    syncLocal({ ...state, barbers: updatedBarbers });
    return { success: true };
  };

  // Admin Actions
  const updateService = async (serviceId: string, updates: Partial<ServiceItem>) => {
    try {
      await fetch(`${BACKEND_URL}/api/admin/service`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ serviceId, ...updates })
      });
    } catch {}

    const updated = state.services.map(s => s.id === serviceId ? { ...s, ...updates } : s);
    syncLocal({ ...state, services: updated });
  };

  const toggleBarberDuty = async (barberId: string, onDuty: boolean) => {
    try {
      await fetch(`${BACKEND_URL}/api/admin/barber-duty`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ barberId, onDuty })
      });
    } catch {}

    const updated = state.barbers.map(b => b.id === barberId ? { ...b, onDuty } : b);
    syncLocal({ ...state, barbers: updated });
  };

  const toggleQueue = async (open: boolean) => {
    try {
      await fetch(`${BACKEND_URL}/api/admin/toggle-queue`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isQueueOpen: open })
      });
    } catch {}

    syncLocal({ ...state, isQueueOpen: open });
  };

  const resetDailyQueue = async () => {
    try {
      await fetch(`${BACKEND_URL}/api/admin/reset`, { method: 'POST' });
    } catch {}

    const updatedBarbers = state.barbers.map(b => ({ ...b, status: 'free' as const, currentTicketId: null }));
    syncLocal({
      ...state,
      tickets: [],
      barbers: updatedBarbers,
      todayStats: { customersServed: 0, noShows: 0, totalWaitTimeMinutes: 0 }
    });
  };

  return (
    <SalonContext.Provider
      value={{
        state,
        language,
        setLanguage,
        t,
        joinQueue,
        callNext,
        updateStatus,
        toggleBarberBreak,
        updateService,
        toggleBarberDuty,
        toggleQueue,
        resetDailyQueue,
        activeAlert,
        clearAlert,
        isConnected
      }}
    >
      {children}
    </SalonContext.Provider>
  );
};

export const useSalon = () => {
  const context = useContext(SalonContext);
  if (!context) {
    throw new Error('useSalon must be used within a SalonProvider');
  }
  return context;
};
