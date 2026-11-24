export type OrderStatus = 'Waiting' | 'Called' | 'In chair' | 'Done' | 'Cancelled' | 'No-show';

export interface ServiceItem {
  id: string;
  nameEn: string;
  nameGu: string;
  duration: number; // minutes
  price: number; // INR
  active: boolean;
  category: 'Hair' | 'Beard' | 'Spa' | 'Color';
}

export interface Barber {
  id: string;
  name: string;
  photo: string;
  status: 'free' | 'busy' | 'break';
  onDuty: boolean;
  currentTicketId?: string | null;
}

export interface QueueTicket {
  id: string;
  token: string; // e.g. "S-14"
  customerName: string;
  phone: string;
  services: ServiceItem[];
  preferredBarberId: string; // "any" or barberId
  preferredBarberName: string;
  assignedBarberId?: string | null;
  assignedBarberName?: string | null;
  status: OrderStatus;
  createdAt: number; // timestamp
  calledAt?: number | null;
  startedAt?: number | null;
  completedAt?: number | null;
  totalDuration: number;
  totalPrice: number;
}

export interface SalonState {
  isQueueOpen: boolean;
  barbers: Barber[];
  services: ServiceItem[];
  tickets: QueueTicket[];
  todayStats: {
    customersServed: number;
    noShows: number;
    totalWaitTimeMinutes: number;
  };
}
