// Matcher Service
// Prize matching logic for Max 3D+

import type { Env, Ticket, DrawResult, Prize, Participant } from '../types/entities';
import { getAllPairs } from '../models/drawResult';
import { createWinNotification } from '../models/winNotification';
import { getAllTickets, getParticipant, saveWinNotification, checkExistingNotification } from './kv';
import { sendWinNotification, sendBatchWinNotifications } from './notifier';
import { logger } from '../utils/logger';

/**
 * Match a single ticket against draw result
 * Returns the prize won or null if no match
 */
export function matchTicket(ticket: Ticket, result: DrawResult): Prize | null {
  const [t1, t2] = ticket.numbers;

  // Giải nhất: trùng cả 2 bộ với cặp giải nhất
  if (matchesPair(t1, t2, result.first)) {
    return Prize.FIRST;
  }

  // Giải nhì: trùng cả 2 bộ với bất kỳ cặp giải nhì
  for (const pair of result.second) {
    if (matchesPair(t1, t2, pair)) {
      return Prize.SECOND;
    }
  }

  // Giải ba: trùng cả 2 bộ với bất kỳ cặp giải ba
  for (const pair of result.third) {
    if (matchesPair(t1, t2, pair)) {
      return Prize.THIRD;
    }
  }

  // Giải tư: trùng cả 2 bộ với bất kỳ cặp giải tư
  for (const pair of result.fourth) {
    if (matchesPair(t1, t2, pair)) {
      return Prize.FOURTH;
    }
  }

  // Giải năm: trùng cả 2 bộ với bất kỳ cặp trong toàn bộ 10 cặp
  const allPairs = getAllPairs(result);
  for (const pair of allPairs) {
    if (matchesPair(t1, t2, pair)) {
      return Prize.FIFTH;
    }
  }

  // Giải sáu: trùng 1 bộ với cặp giải nhất
  if (matchesOneInPair(t1, t2, result.first)) {
    return Prize.SIXTH;
  }

  // Giải bảy: trùng 1 bộ với bất kỳ cặp trong giải nhì/ba/tư
  const secondaryPairs = [...result.second, ...result.third, ...result.fourth];
  for (const pair of secondaryPairs) {
    if (matchesOneInPair(t1, t2, pair)) {
      return Prize.SEVENTH;
    }
  }

  return null;
}

/**
 * Check if ticket matches a pair exactly (both numbers, order-independent)
 */
function matchesPair(t1: string, t2: string, pair: [string, string]): boolean {
  // Sort both to compare order-independently
  const sortedTicket = [t1, t2].sort();
  const sortedPair = [pair[0], pair[1]].sort();
  return sortedTicket[0] === sortedPair[0] && sortedTicket[1] === sortedPair[1];
}

/**
 * Check if ticket matches at least one number in a pair
 */
function matchesOneInPair(t1: string, t2: string, pair: [string, string]): boolean {
  return [t1, t2].some((t) => pair.includes(t));
}

/**
 * Match all tickets against a draw result
 * Creates win notifications and sends webhooks
 */
export async function matchAllTickets(
  env: Env,
  result: DrawResult
): Promise<{ winners: number; notifications: number }> {
  logger.info('Starting ticket matching', { drawDate: result.date, resultStatus: result.status });

  if (result.status !== 'complete') {
    logger.warn('Cannot match incomplete results', { fetchedCount: result.fetchedCount });
    return { winners: 0, notifications: 0 };
  }

  // Get all tickets
  const tickets = await getAllTickets(env.KV);
  logger.info('Loaded tickets for matching', { ticketCount: tickets.length });

  let winnerCount = 0;
  let notificationCount = 0;
  const notifications: Array<{ participantName: string; ticketNumbers: [string, string]; prize: Prize }> = [];

  for (const ticket of tickets) {
    // Check if already notified for this draw
    const alreadyNotified = await checkExistingNotification(env.KV, ticket.id, result.date);
    if (alreadyNotified) {
      logger.debug('Ticket already has notification', { ticketId: ticket.id });
      continue;
    }

    // Match ticket
    const prize = matchTicket(ticket, result);
    if (!prize) {
      continue;
    }

    winnerCount++;
    logger.info('Winner found!', {
      ticketId: ticket.id,
      numbers: ticket.numbers,
      prize,
    });

    // Get participant info
    const participant = await getParticipant(env.KV, ticket.participantId);
    if (!participant) {
      logger.warn('Participant not found for winning ticket', { ticketId: ticket.id });
      continue;
    }

    // Create notification
    const notification = createWinNotification(ticket, participant, prize, result.date);
    await saveWinNotification(env.KV, notification);
    notificationCount++;

    notifications.push({
      participantName: participant.name,
      ticketNumbers: ticket.numbers,
      prize,
    });
  }

  // Send batch notifications via webhook
  if (notifications.length > 0 && env.LARK_WEBHOOK_URL) {
    await sendBatchWinNotifications(env, notifications, result.date);
  }

  logger.info('Matching complete', { winners: winnerCount, notifications: notificationCount });
  return { winners: winnerCount, notifications: notificationCount };
}

/**
 * Get prize display name in Vietnamese
 */
export function getPrizeDisplayName(prize: Prize): string {
  const names: Record<Prize, string> = {
    [Prize.FIRST]: 'Giải Nhất',
    [Prize.SECOND]: 'Giải Nhì',
    [Prize.THIRD]: 'Giải Ba',
    [Prize.FOURTH]: 'Giải Tư',
    [Prize.FIFTH]: 'Giải Năm',
    [Prize.SIXTH]: 'Giải Sáu',
    [Prize.SEVENTH]: 'Giải Bảy',
  };
  return names[prize] || prize;
}
