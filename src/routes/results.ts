// Results Routes
// API endpoints for draw results

import { Router } from 'express';
import type { Request, Response } from 'express';
import type { Env, ApiResponse } from '../types/entities';
import { getDrawResult, saveDrawResult } from '../services/kv';
import { triggerManualFetch } from '../services/scheduler';
import { validateDate, getTodayDateString } from '../utils/validation';
import { logger } from '../utils/logger';

export const resultsRouter = Router();

/**
 * GET /api/v1/results/today
 * Get today's draw result
 */
resultsRouter.get('/today', async (req: Request, res: Response): Promise<void> => {
  const env: Env = req.app.locals.env;
  const today = getTodayDateString();

  try {
    const result = await getDrawResult(env.KV, today);

    if (!result) {
      const response: ApiResponse<never> = {
        success: false,
        error: {
          code: 'RESULT_NOT_FOUND',
          message: 'Chưa có kết quả cho ngày hôm nay',
        },
      };
      res.status(404).json(response);
      return;
    }

    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    logger.error('Failed to get today result', error);
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Lỗi khi lấy kết quả' },
    });
  }
});

/**
 * GET /api/v1/results/:date
 * Get draw result by date
 */
resultsRouter.get('/:date', async (req: Request, res: Response): Promise<void> => {
  const env: Env = req.app.locals.env;
  const { date } = req.params;

  // Validate date format
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
    const result = await getDrawResult(env.KV, date);

    if (!result) {
      const response: ApiResponse<never> = {
        success: false,
        error: {
          code: 'RESULT_NOT_FOUND',
          message: 'Chưa có kết quả cho ngày này',
        },
      };
      res.status(404).json(response);
      return;
    }

    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    logger.error('Failed to get result by date', error, { date });
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Lỗi khi lấy kết quả' },
    });
  }
});

/**
 * POST /api/v1/results/fetch
 * Manually trigger fetch (for testing)
 */
resultsRouter.post('/fetch', async (req: Request, res: Response): Promise<void> => {
  const env: Env = req.app.locals.env;
  const { force = false } = req.body;

  try {
    const result = await triggerManualFetch(env, force);

    if (result.success) {
      res.status(202).json({
        success: true,
        data: {
          message: result.message,
          status: result.status,
          fetchedCount: result.fetchedCount,
        },
      });
    } else {
      res.status(500).json({
        success: false,
        error: {
          code: 'FETCH_FAILED',
          message: result.message,
        },
      });
    }
  } catch (error) {
    logger.error('Manual fetch failed', error);
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Lỗi khi fetch kết quả' },
    });
  }
});
