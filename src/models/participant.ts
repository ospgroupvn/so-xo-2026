// Participant Model
// Factory functions for creating Participant entities

import { v4 as uuidv4 } from 'uuid';
import type { Participant } from '../types/entities';
import { sanitizeName } from '../utils/validation';

/**
 * Create a new Participant entity
 */
export function createParticipant(name: string): Participant {
  const sanitized = sanitizeName(name);

  return {
    id: uuidv4(),
    name: sanitized,
    ticketIds: [],
    createdAt: new Date().toISOString(),
  };
}

/**
 * Add a ticket ID to a participant
 */
export function addTicketToParticipant(participant: Participant, ticketId: string): Participant {
  return {
    ...participant,
    ticketIds: [...participant.ticketIds, ticketId],
  };
}

/**
 * Remove a ticket ID from a participant
 */
export function removeTicketFromParticipant(
  participant: Participant,
  ticketId: string
): Participant {
  return {
    ...participant,
    ticketIds: participant.ticketIds.filter((id) => id !== ticketId),
  };
}

/**
 * Validate participant data
 */
export function validateParticipant(data: unknown): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (!data || typeof data !== 'object') {
    return { valid: false, errors: ['Invalid participant data'] };
  }

  const participant = data as Partial<Participant>;

  if (!participant.id || typeof participant.id !== 'string') {
    errors.push('Missing or invalid id');
  }

  if (!participant.name || typeof participant.name !== 'string') {
    errors.push('Missing or invalid name');
  }

  if (!Array.isArray(participant.ticketIds)) {
    errors.push('ticketIds must be an array');
  }

  if (!participant.createdAt || typeof participant.createdAt !== 'string') {
    errors.push('Missing or invalid createdAt');
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}
