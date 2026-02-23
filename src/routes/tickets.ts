// Tickets Routes
// API endpoints for ticket operations

import { Router } from 'express';
import type { Request, Response } from 'express';
import type { Env, ApiResponse } from '../types/entities';
import { requireAdminAuth } from '../middleware/adminAuth';
import {
  registerTicket,
  listTickets,
  getTicketById,
  updateTicketNumbers,
  removeTicket,
} from '../services/ticketService';
import {
  validateCreateTicketRequest,
  validateUpdateTicketRequest,
  validatePagination,
} from '../utils/validation';
import { logger } from '../utils/logger';

export const ticketsRouter = Router();

/**
 * POST /api/v1/tickets
 * Register a new ticket
 */
ticketsRouter.post('/', async (req: Request, res: Response): Promise<void> => {
  const env: Env = req.app.locals.env;

  // Validate request
  const validation = validateCreateTicketRequest(req.body);
  if (!validation.valid) {
    const response: ApiResponse<never> = {
      success: false,
      error: {
        code: 'VALIDATION_ERROR',
        message: 'Dữ liệu không hợp lệ',
        details: validation.errors,
      },
    };
    res.status(400).json(response);
    return;
  }

  const result = await registerTicket(env, validation.data!.name, validation.data!.numbers);

  if (result.success) {
    res.status(201).json(result);
  } else if (result.error?.code === 'DUPLICATE_TICKET') {
    res.status(409).json(result);
  } else {
    res.status(500).json(result);
  }
});

/**
 * GET /api/v1/tickets
 * List all tickets with pagination
 */
ticketsRouter.get('/', async (req: Request, res: Response): Promise<void> => {
  const env: Env = req.app.locals.env;
  const { page, limit } = validatePagination(req.query as Record<string, unknown>);

  const result = await listTickets(env, page, limit);
  res.status(200).json(result);
});

/**
 * GET /api/v1/tickets/:id
 * Get a single ticket by ID
 */
ticketsRouter.get('/:id', async (req: Request, res: Response): Promise<void> => {
  const env: Env = req.app.locals.env;
  const { id } = req.params;

  const result = await getTicketById(env, id);

  if (result.success) {
    res.status(200).json(result);
  } else if (result.error?.code === 'TICKET_NOT_FOUND') {
    res.status(404).json(result);
  } else {
    res.status(500).json(result);
  }
});

/**
 * PUT /api/v1/tickets/:id
 * Update ticket numbers (admin only)
 */
ticketsRouter.put(
  '/:id',
  requireAdminAuth,
  async (req: Request, res: Response): Promise<void> => {
    const env: Env = req.app.locals.env;
    const { id } = req.params;

    // Validate request
    const validation = validateUpdateTicketRequest(req.body);
    if (!validation.valid) {
      const response: ApiResponse<never> = {
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Dữ liệu không hợp lệ',
          details: validation.errors,
        },
      };
      res.status(400).json(response);
      return;
    }

    const result = await updateTicketNumbers(env, id, validation.data!.numbers);

    if (result.success) {
      res.status(200).json(result);
    } else if (result.error?.code === 'TICKET_NOT_FOUND') {
      res.status(404).json(result);
    } else if (result.error?.code === 'DUPLICATE_TICKET') {
      res.status(409).json(result);
    } else {
      res.status(500).json(result);
    }
  }
);

/**
 * DELETE /api/v1/tickets/:id
 * Delete a ticket (admin only)
 */
ticketsRouter.delete(
  '/:id',
  requireAdminAuth,
  async (req: Request, res: Response): Promise<void> => {
    const env: Env = req.app.locals.env;
    const { id } = req.params;

    const result = await removeTicket(env, id);

    if (result.success) {
      res.status(200).json(result);
    } else if (result.error?.code === 'TICKET_NOT_FOUND') {
      res.status(404).json(result);
    } else {
      res.status(500).json(result);
    }
  }
);
