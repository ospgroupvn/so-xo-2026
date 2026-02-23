// Cloudflare KV Service
// Provides CRUD operations for Cloudflare KV storage

import type { Env, Participant, Ticket, DrawResult, WinNotification } from '../types/entities';

const KV_TTL = 86400; // 24 hours in seconds

// Key patterns
const KEYS = {
  participant: (id: string) => `participant:${id}`,
  ticket: (id: string) => `ticket:${id}`,
  ticketByNumbers: (num1: string, num2: string) => `ticket:by_numbers:${num1}:${num2}`,
  drawResult: (date: string) => `draw_result:${date}`,
  winNotification: (id: string) => `win_notification:${id}`,
  winNotificationByTicket: (ticketId: string, drawDate: string) =>
    `win_notification:by_ticket:${ticketId}:${drawDate}`,
  listParticipants: 'list:participants',
  listTickets: 'list:tickets',
};

// ==================== Participant Operations ====================

export async function getParticipant(kv: KVNamespace, id: string): Promise<Participant | null> {
  const data = await kv.get(KEYS.participant(id), 'json');
  return data as Participant | null;
}

export async function saveParticipant(kv: KVNamespace, participant: Participant): Promise<void> {
  await kv.put(KEYS.participant(participant.id), JSON.stringify(participant), {
    expirationTtl: KV_TTL,
  });

  // Add to participants list
  const listKey = KEYS.listParticipants;
  const existingList = (await kv.get(listKey, 'json')) as string[] | null;
  if (existingList && !existingList.includes(participant.id)) {
    await kv.put(listKey, JSON.stringify([...existingList, participant.id]), {
      expirationTtl: KV_TTL,
    });
  } else if (!existingList) {
    await kv.put(listKey, JSON.stringify([participant.id]), {
      expirationTtl: KV_TTL,
    });
  }
}

export async function updateParticipant(
  kv: KVNamespace,
  id: string,
  updates: Partial<Participant>
): Promise<Participant | null> {
  const existing = await getParticipant(kv, id);
  if (!existing) return null;

  const updated = { ...existing, ...updates };
  await saveParticipant(kv, updated);
  return updated;
}

export async function getAllParticipants(kv: KVNamespace): Promise<Participant[]> {
  const listKey = KEYS.listParticipants;
  const ids = (await kv.get(listKey, 'json')) as string[] | null;
  if (!ids || ids.length === 0) return [];

  const participants: Participant[] = [];
  for (const id of ids) {
    const participant = await getParticipant(kv, id);
    if (participant) participants.push(participant);
  }
  return participants;
}

// ==================== Ticket Operations ====================

export async function getTicket(kv: KVNamespace, id: string): Promise<Ticket | null> {
  const data = await kv.get(KEYS.ticket(id), 'json');
  return data as Ticket | null;
}

export async function saveTicket(kv: KVNamespace, ticket: Ticket): Promise<void> {
  await kv.put(KEYS.ticket(ticket.id), JSON.stringify(ticket), {
    expirationTtl: KV_TTL,
  });

  // Create index for duplicate check
  const [num1, num2] = ticket.numbers.sort();
  await kv.put(KEYS.ticketByNumbers(num1, num2), ticket.id, {
    expirationTtl: KV_TTL,
  });

  // Add to tickets list
  const listKey = KEYS.listTickets;
  const existingList = (await kv.get(listKey, 'json')) as string[] | null;
  if (existingList && !existingList.includes(ticket.id)) {
    await kv.put(listKey, JSON.stringify([...existingList, ticket.id]), {
      expirationTtl: KV_TTL,
    });
  } else if (!existingList) {
    await kv.put(listKey, JSON.stringify([ticket.id]), {
      expirationTtl: KV_TTL,
    });
  }
}

export async function updateTicket(
  kv: KVNamespace,
  id: string,
  numbers: [string, string]
): Promise<Ticket | null> {
  const existing = await getTicket(kv, id);
  if (!existing) return null;

  // Remove old index
  const [oldNum1, oldNum2] = existing.numbers.sort();
  await kv.delete(KEYS.ticketByNumbers(oldNum1, oldNum2));

  // Update ticket
  const updated: Ticket = { ...existing, numbers };
  await saveTicket(kv, updated);
  return updated;
}

export async function deleteTicket(kv: KVNamespace, id: string): Promise<boolean> {
  const existing = await getTicket(kv, id);
  if (!existing) return false;

  // Remove index
  const [num1, num2] = existing.numbers.sort();
  await kv.delete(KEYS.ticketByNumbers(num1, num2));

  // Remove ticket
  await kv.delete(KEYS.ticket(id));

  // Remove from tickets list
  const listKey = KEYS.listTickets;
  const existingList = (await kv.get(listKey, 'json')) as string[] | null;
  if (existingList) {
    const newList = existingList.filter((tid) => tid !== id);
    await kv.put(listKey, JSON.stringify(newList), { expirationTtl: KV_TTL });
  }

  // Remove from participant's ticketIds
  const participant = await getParticipant(kv, existing.participantId);
  if (participant) {
    participant.ticketIds = participant.ticketIds.filter((tid) => tid !== id);
    await saveParticipant(kv, participant);
  }

  return true;
}

export async function findTicketByNumbers(
  kv: KVNamespace,
  numbers: [string, string]
): Promise<Ticket | null> {
  const [num1, num2] = numbers.sort();
  const ticketId = await kv.get(KEYS.ticketByNumbers(num1, num2));
  if (!ticketId) return null;
  return getTicket(kv, ticketId);
}

export async function checkDuplicateTicket(
  kv: KVNamespace,
  numbers: [string, string],
  excludeId?: string
): Promise<{ isDuplicate: boolean; existingOwner?: string }> {
  const ticket = await findTicketByNumbers(kv, numbers);
  if (!ticket) return { isDuplicate: false };
  if (excludeId && ticket.id === excludeId) return { isDuplicate: false };

  const participant = await getParticipant(kv, ticket.participantId);
  return { isDuplicate: true, existingOwner: participant?.name };
}

export async function getAllTickets(kv: KVNamespace): Promise<Ticket[]> {
  const listKey = KEYS.listTickets;
  const ids = (await kv.get(listKey, 'json')) as string[] | null;
  if (!ids || ids.length === 0) return [];

  const tickets: Ticket[] = [];
  for (const id of ids) {
    const ticket = await getTicket(kv, id);
    if (ticket) tickets.push(ticket);
  }
  return tickets;
}

export async function getTicketsWithPagination(
  kv: KVNamespace,
  page: number = 1,
  limit: number = 50
): Promise<{ tickets: Ticket[]; total: number }> {
  const allTickets = await getAllTickets(kv);
  const total = allTickets.length;
  const start = (page - 1) * limit;
  const tickets = allTickets.slice(start, start + limit);
  return { tickets, total };
}

// ==================== DrawResult Operations ====================

export async function getDrawResult(kv: KVNamespace, date: string): Promise<DrawResult | null> {
  const data = await kv.get(KEYS.drawResult(date), 'json');
  return data as DrawResult | null;
}

export async function saveDrawResult(kv: KVNamespace, result: DrawResult): Promise<void> {
  await kv.put(KEYS.drawResult(result.date), JSON.stringify(result), {
    expirationTtl: KV_TTL,
  });
}

export async function updateDrawResult(
  kv: KVNamespace,
  date: string,
  updates: Partial<DrawResult>
): Promise<DrawResult | null> {
  const existing = await getDrawResult(kv, date);
  if (!existing) return null;

  const updated = { ...existing, ...updates };
  await saveDrawResult(kv, updated);
  return updated;
}

// ==================== WinNotification Operations ====================

export async function getWinNotification(
  kv: KVNamespace,
  id: string
): Promise<WinNotification | null> {
  const data = await kv.get(KEYS.winNotification(id), 'json');
  return data as WinNotification | null;
}

export async function saveWinNotification(
  kv: KVNamespace,
  notification: WinNotification
): Promise<void> {
  await kv.put(KEYS.winNotification(notification.id), JSON.stringify(notification), {
    expirationTtl: KV_TTL,
  });

  // Create index for duplicate check
  const indexKey = KEYS.winNotificationByTicket(notification.ticketId, notification.drawDate);
  await kv.put(indexKey, notification.id, { expirationTtl: KV_TTL });
}

export async function checkExistingNotification(
  kv: KVNamespace,
  ticketId: string,
  drawDate: string
): Promise<boolean> {
  const indexKey = KEYS.winNotificationByTicket(ticketId, drawDate);
  const existing = await kv.get(indexKey);
  return existing !== null;
}

export async function getWinnersByDate(
  kv: KVNamespace,
  date: string
): Promise<WinNotification[]> {
  // Note: In production, we'd use a proper index
  // For now, we'll scan through all notifications
  const list = await kv.list({ prefix: 'win_notification:' });
  const winners: WinNotification[] = [];

  for (const key of list.keys) {
    if (key.name.startsWith('win_notification:by_ticket:')) continue;
    const data = await kv.get(key.name, 'json');
    if (data && (data as WinNotification).drawDate === date) {
      winners.push(data as WinNotification);
    }
  }

  return winners;
}

// ==================== Health Check ====================

export async function checkKvHealth(kv: KVNamespace): Promise<'connected' | 'disconnected'> {
  try {
    await kv.get('__health_check__');
    return 'connected';
  } catch {
    return 'disconnected';
  }
}
