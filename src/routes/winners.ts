// Winners Routes
// API endpoints for winners list

import { Router } from 'express';
import type { Request, Response } from 'express';
import type { Env, ApiResponse, Prize } from '../types/entities';
import { getWinnersByDate } from '../services/kv';
import { validateDate, getTodayDateString } from '../utils/validation';
import { getPrizeDisplayName } from '../services/matcher';
import { logger } from '../utils/logger';

export const winnersRouter = Router();

/**
 * GET /api/v1/winners
 * Get winners list for a date
 */
winnersRouter.get('/', async (req: Request, res: Response): Promise<void> => {
  const env: Env = req.app.locals.env;
  const { date = getTodayDateString(), prize } = req.query as Record<string, string>;

  // Validate date
  const validation = validateDate(date);
  if (!validation.valid) {
    res.status(400).json({
      success: false,
      error: {
        code: 'VALIDATION_ERROR',
        message: validation.errors.join(', '),
      },
    });
    return;
  }

  try {
    const winners = await getWinnersByDate(env.KV, date);

    // Filter by prize if specified
    const filteredWinners = prize
      ? winners.filter((w) => w.prize.toLowerCase().includes(prize.toLowerCase()))
      : winners;

    // Calculate summary
    const summary: Record<string, number> = {
      total: filteredWinners.length,
    };

    // Count by prize
    const prizeCounts: Partial<Record<Prize, number>> = {};
    for (const winner of filteredWinners) {
      prizeCounts[winner.prize] = (prizeCounts[winner.prize] || 0) + 1;
    }

    // Format response
    const response = {
      success: true,
      data: {
        date,
        winners: filteredWinners.map((w) => ({
          id: w.id,
          participantName: w.participantName,
          ticketNumbers: w.ticketNumbers,
          prize: w.prize,
          prizeDisplayName: getPrizeDisplayName(w.prize),
          webhookSent: w.webhookSent,
          createdAt: w.createdAt,
        })),
        summary: {
          ...prizeCounts,
          total: filteredWinners.length,
        },
      },
    };

    res.status(200).json(response);
  } catch (error) {
    logger.error('Failed to get winners', error, { date });
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Lỗi khi lấy danh sách người trúng giải' },
    });
  }
});
