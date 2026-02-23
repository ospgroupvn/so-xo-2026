// WinNotification Model
// Factory functions for creating WinNotification entities

import { v4 as uuidv4 } from 'uuid';
import type { WinNotification, Prize, Ticket, Participant } from '../types/entities';

/**
 * Create a new WinNotification entity
 */
export function createWinNotification(
  ticket: Ticket,
  participant: Participant,
  prize: Prize,
  drawDate: string
): WinNotification {
  return {
    id: uuidv4(),
    ticketId: ticket.id,
    participantId: participant.id,
    participantName: participant.name,
    ticketNumbers: ticket.numbers,
    prize,
    drawDate,
    webhookSent: false,
    createdAt: new Date().toISOString(),
  };
}

/**
 * Validate WinNotification data
 */
export function validateWinNotification(data: unknown): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (!data || typeof data !== 'object') {
    return { valid: false, errors: ['Invalid win notification data'] };
  }

  const notification = data as Partial<WinNotification>;

  if (!notification.id || typeof notification.id !== 'string') {
    errors.push('Missing or invalid id');
  }

  if (!notification.ticketId || typeof notification.ticketId !== 'string') {
    errors.push('Missing or invalid ticketId');
  }

  if (!notification.participantId || typeof notification.participantId !== 'string') {
    errors.push('Missing or invalid participantId');
  }

  if (!notification.participantName || typeof notification.participantName !== 'string') {
    errors.push('Missing or invalid participantName');
  }

  if (!Array.isArray(notification.ticketNumbers) || notification.ticketNumbers.length !== 2) {
    errors.push('ticketNumbers must be an array of 2 elements');
  }

  if (!notification.prize || typeof notification.prize !== 'string') {
    errors.push('Missing or invalid prize');
  }

  if (!notification.drawDate || typeof notification.drawDate !== 'string') {
    errors.push('Missing or invalid drawDate');
  }

  if (typeof notification.webhookSent !== 'boolean') {
    errors.push('webhookSent must be a boolean');
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Mark notification as webhook sent
 */
export function markWebhookSent(notification: WinNotification): WinNotification {
  return {
    ...notification,
    webhookSent: true,
  };
}
