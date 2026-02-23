// Health Check Route
// Provides system health status endpoint

import { Router } from 'express';
import type { Request, Response } from 'express';
import type { Env, ApiResponse } from '../types/entities';
import { checkKvHealth } from '../services/kv';
import { logger } from '../utils/logger';

export const healthRouter = Router();

interface HealthResponse {
  status: 'ok' | 'degraded';
  timestamp: string;
  services: {
    kv: 'connected' | 'disconnected';
    scheduler: 'running' | 'stopped';
  };
}

/**
 * GET /health
 * Returns system health status
 */
healthRouter.get('/', async (req: Request, res: Response): Promise<void> => {
  const env: Env = req.app.locals.env;
  const timestamp = new Date().toISOString();

  try {
    // Check KV health
    const kvStatus = await checkKvHealth(env.KV);

    // Determine overall status
    const status = kvStatus === 'connected' ? 'ok' : 'degraded';

    const response: ApiResponse<HealthResponse> = {
      success: true,
      data: {
        status,
        timestamp,
        services: {
          kv: kvStatus,
          scheduler: 'running', // In Cloudflare Workers, cron is managed by the platform
        },
      },
    };

    // Log health check
    logger.debug('Health check performed', { status, kv: kvStatus });

    // Return appropriate status code
    res.status(status === 'ok' ? 200 : 503).json(response);
  } catch (error) {
    logger.error('Health check failed', error);

    const response: ApiResponse<HealthResponse> = {
      success: false,
      data: {
        status: 'degraded',
        timestamp,
        services: {
          kv: 'disconnected',
          scheduler: 'stopped',
        },
      },
    };

    res.status(503).json(response);
  }
});

/**
 * GET /health/live
 * Liveness probe - returns 200 if the service is running
 */
healthRouter.get('/live', (_req: Request, res: Response): void => {
  res.status(200).json({ status: 'alive' });
});

/**
 * GET /health/ready
 * Readiness probe - returns 200 if the service is ready to accept traffic
 */
healthRouter.get('/ready', async (req: Request, res: Response): Promise<void> => {
  const env: Env = req.app.locals.env;

  try {
    const kvStatus = await checkKvHealth(env.KV);

    if (kvStatus === 'connected') {
      res.status(200).json({ status: 'ready' });
    } else {
      res.status(503).json({ status: 'not ready', reason: 'KV disconnected' });
    }
  } catch {
    res.status(503).json({ status: 'not ready', reason: 'Health check failed' });
  }
});
