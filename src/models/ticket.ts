// Ticket Model
// Factory functions for creating Ticket entities

import { v4 as uuidv4 } from 'uuid';
import type { Ticket } from '../types/entities';
import { normalizeTicketNumbers, validateTicketNumbers } from '../utils/validation';

/**
 * Create a new Ticket entity
 */
export function createTicket(participantId: string, numbers: [string, string]): Ticket {
  const normalized = normalizeTicketNumbers(numbers);

  return {
    id: uuidv4(),
    participantId,
    numbers: normalized,
    createdAt: new Date().toISOString(),
  };
}

/**
 * Validate ticket data
 */
export function validateTicket(data: unknown): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (!data || typeof data !== 'object') {
    return { valid: false, errors: ['Invalid ticket data'] };
  }

  const ticket = data as Partial<Ticket>;

  if (!ticket.id || typeof ticket.id !== 'string') {
    errors.push('Missing or invalid id');
  }

  if (!ticket.participantId || typeof ticket.participantId !== 'string') {
    errors.push('Missing or invalid participantId');
  }

  const numbersValidation = validateTicketNumbers(ticket.numbers);
  if (!numbersValidation.valid) {
    errors.push(...numbersValidation.errors);
  }

  if (!ticket.createdAt || typeof ticket.createdAt !== 'string') {
    errors.push('Missing or invalid createdAt');
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Check if two ticket numbers match (order-independent)
 */
export function ticketsMatch(a: [string, string], b: [string, string]): boolean {
  const sortedA = [...a].sort();
  const sortedB = [...b].sort();
  return sortedA[0] === sortedB[0] && sortedA[1] === sortedB[1];
}

/**
 * Format ticket numbers for display
 */
export function formatTicketNumbers(numbers: [string, string]): string {
  return numbers.join(' - ');
}
