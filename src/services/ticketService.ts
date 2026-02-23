// Ticket Service
// Business logic for ticket operations

import type { Env, Participant, Ticket, TicketResponse, TicketListResponse, ApiResponse } from '../types/entities';
import { createParticipant, addTicketToParticipant } from '../models/participant';
import { createTicket } from '../models/ticket';
import {
  getParticipant,
  saveParticipant,
  getTicket,
  saveTicket,
  deleteTicket,
  getAllTickets,
  getTicketsWithPagination,
  checkDuplicateTicket,
  updateTicket as updateTicketInKv,
} from './kv';
import { logger } from '../utils/logger';

/**
 * Register a new ticket with participant
 * Creates or reuses participant based on name
 */
export async function registerTicket(
  env: Env,
  name: string,
  numbers: [string, string]
): Promise<ApiResponse<TicketResponse>> {
  try {
    // Check for duplicate ticket
    const duplicateCheck = await checkDuplicateTicket(env.KV, numbers);
    if (duplicateCheck.isDuplicate) {
      logger.warn('Duplicate ticket attempt', { numbers, existingOwner: duplicateCheck.existingOwner });
      return {
        success: false,
        error: {
          code: 'DUPLICATE_TICKET',
          message: 'Vé số này đã được đăng ký bởi người khác',
          details: { existingOwner: duplicateCheck.existingOwner },
        },
      };
    }

    // Find or create participant
    let participant = await findParticipantByName(env.KV, name);
    if (!participant) {
      participant = createParticipant(name);
      await saveParticipant(env.KV, participant);
      logger.info('Created new participant', { participantId: participant.id, name });
    }

    // Create ticket
    const ticket = createTicket(participant.id, numbers);
    await saveTicket(env.KV, ticket);
    logger.info('Created new ticket', { ticketId: ticket.id, participantId: participant.id, numbers });

    // Update participant with ticket ID
    const updatedParticipant = addTicketToParticipant(participant, ticket.id);
    await saveParticipant(env.KV, updatedParticipant);

    return {
      success: true,
      data: {
        id: ticket.id,
        participantId: ticket.participantId,
        name: participant.name,
        numbers: ticket.numbers,
        createdAt: ticket.createdAt,
      },
    };
  } catch (error) {
    logger.error('Failed to register ticket', error);
    return {
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Lỗi khi đăng ký vé số',
      },
    };
  }
}

/**
 * Get all tickets with pagination
 */
export async function listTickets(
  env: Env,
  page: number = 1,
  limit: number = 50
): Promise<ApiResponse<TicketListResponse>> {
  try {
    const { tickets, total } = await getTicketsWithPagination(env.KV, page, limit);
    const totalPages = Math.ceil(total / limit);

    // Get participant names for each ticket
    const ticketsWithNames = await Promise.all(
      tickets.map(async (ticket) => {
        const participant = await getParticipant(env.KV, ticket.participantId);
        return {
          id: ticket.id,
          participantName: participant?.name || 'Unknown',
          numbers: ticket.numbers,
          createdAt: ticket.createdAt,
        };
      })
    );

    return {
      success: true,
      data: {
        tickets: ticketsWithNames,
        pagination: {
          page,
          limit,
          total,
          totalPages,
        },
      },
    };
  } catch (error) {
    logger.error('Failed to list tickets', error);
    return {
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Lỗi khi lấy danh sách vé số',
      },
    };
  }
}

/**
 * Get a single ticket by ID
 */
export async function getTicketById(
  env: Env,
  ticketId: string
): Promise<ApiResponse<TicketResponse>> {
  try {
    const ticket = await getTicket(env.KV, ticketId);
    if (!ticket) {
      return {
        success: false,
        error: {
          code: 'TICKET_NOT_FOUND',
          message: 'Không tìm thấy vé số',
        },
      };
    }

    const participant = await getParticipant(env.KV, ticket.participantId);

    return {
      success: true,
      data: {
        id: ticket.id,
        participantId: ticket.participantId,
        name: participant?.name || 'Unknown',
        numbers: ticket.numbers,
        createdAt: ticket.createdAt,
      },
    };
  } catch (error) {
    logger.error('Failed to get ticket', error, { ticketId });
    return {
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Lỗi khi lấy thông tin vé số',
      },
    };
  }
}

/**
 * Update ticket numbers (admin only)
 */
export async function updateTicketNumbers(
  env: Env,
  ticketId: string,
  numbers: [string, string]
): Promise<ApiResponse<TicketResponse>> {
  try {
    // Check for duplicate (excluding current ticket)
    const duplicateCheck = await checkDuplicateTicket(env.KV, numbers, ticketId);
    if (duplicateCheck.isDuplicate) {
      return {
        success: false,
        error: {
          code: 'DUPLICATE_TICKET',
          message: 'Vé số này đã được đăng ký bởi người khác',
          details: { existingOwner: duplicateCheck.existingOwner },
        },
      };
    }

    const updatedTicket = await updateTicketInKv(env.KV, ticketId, numbers);
    if (!updatedTicket) {
      return {
        success: false,
        error: {
          code: 'TICKET_NOT_FOUND',
          message: 'Không tìm thấy vé số',
        },
      };
    }

    const participant = await getParticipant(env.KV, updatedTicket.participantId);
    logger.info('Updated ticket', { ticketId, numbers });

    return {
      success: true,
      data: {
        id: updatedTicket.id,
        participantId: updatedTicket.participantId,
        name: participant?.name || 'Unknown',
        numbers: updatedTicket.numbers,
        createdAt: updatedTicket.createdAt,
      },
    };
  } catch (error) {
    logger.error('Failed to update ticket', error, { ticketId });
    return {
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Lỗi khi cập nhật vé số',
      },
    };
  }
}

/**
 * Delete a ticket (admin only)
 */
export async function removeTicket(
  env: Env,
  ticketId: string
): Promise<ApiResponse<void>> {
  try {
    const deleted = await deleteTicket(env.KV, ticketId);
    if (!deleted) {
      return {
        success: false,
        error: {
          code: 'TICKET_NOT_FOUND',
          message: 'Không tìm thấy vé số',
        },
      };
    }

    logger.info('Deleted ticket', { ticketId });
    return {
      success: true,
    };
  } catch (error) {
    logger.error('Failed to delete ticket', error, { ticketId });
    return {
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Lỗi khi xóa vé số',
      },
    };
  }
}

// ==================== Helper Functions ====================

/**
 * Find participant by name (case-insensitive)
 */
async function findParticipantByName(
  kv: KVNamespace,
  name: string
): Promise<Participant | null> {
  // Get all participants and search by name
  // Note: In production, we'd use a proper index
  const list = await kv.list({ prefix: 'participant:' });

  for (const key of list.keys) {
    const data = await kv.get(key.name, 'json');
    if (data && (data as Participant).name.toLowerCase() === name.toLowerCase()) {
      return data as Participant;
    }
  }

  return null;
}
