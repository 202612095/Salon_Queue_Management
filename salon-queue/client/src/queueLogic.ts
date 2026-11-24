import type { OrderStatus, QueueTicket } from './types';

/**
 * Calculates estimated wait time for a ticket or general queue
 * Formula: Total service minutes ahead / Number of active working barbers
 */
export function calculateWaitTime(
  tickets: QueueTicket[],
  activeBarbersCount: number,
  targetTicketId?: string
): number {
  const workingBarbers = Math.max(1, activeBarbersCount);
  const waitingTickets = tickets.filter(t => t.status === 'Waiting');

  if (waitingTickets.length === 0) return 0;

  let serviceMinutesAhead = 0;

  if (!targetTicketId) {
    // Total wait time for the whole queue
    serviceMinutesAhead = waitingTickets.reduce((sum, t) => sum + t.totalDuration, 0);
  } else {
    // Wait time specifically for target ticket
    const targetIndex = waitingTickets.findIndex(t => t.id === targetTicketId);
    if (targetIndex === -1) return 0;
    
    // Sum durations of all tickets before target
    const ticketsAhead = waitingTickets.slice(0, targetIndex);
    serviceMinutesAhead = ticketsAhead.reduce((sum, t) => sum + t.totalDuration, 0);
  }

  return Math.ceil(serviceMinutesAhead / workingBarbers);
}

/**
 * Calculates queue position (1-based index)
 */
export function getQueuePosition(tickets: QueueTicket[], ticketId: string): number {
  const waitingTickets = tickets.filter(t => t.status === 'Waiting');
  const index = waitingTickets.findIndex(t => t.id === ticketId);
  return index === -1 ? 0 : index + 1;
}

/**
 * Rule: Call next for barber X picks earliest customer who chose X or 'Any'.
 * A customer who chose another specific barber is skipped.
 */
export function findNextTicketForBarber(
  tickets: QueueTicket[],
  barberId: string
): QueueTicket | undefined {
  return tickets.find(
    t => t.status === 'Waiting' && (t.preferredBarberId === 'any' || t.preferredBarberId === barberId)
  );
}

/**
 * Validates forward-only status transitions
 */
export function isValidStatusTransition(current: OrderStatus, next: OrderStatus): boolean {
  if (current === 'Waiting') {
    return next === 'Called' || next === 'Cancelled';
  }
  if (current === 'Called') {
    return next === 'In chair' || next === 'No-show';
  }
  if (current === 'In chair') {
    return next === 'Done';
  }
  return false;
}
