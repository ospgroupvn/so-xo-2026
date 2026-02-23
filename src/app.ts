// Express Application Setup
// Main Express app with middleware configuration

import express from 'express';
import type { Request, Response, NextFunction } from 'express';
import type { Env, ApiResponse } from './types/entities';
import { logger } from './utils/logger';

// Routes
import { healthRouter } from './routes/health';
import { ticketsRouter } from './routes/tickets';
import { resultsRouter } from './routes/results';
import { winnersRouter } from './routes/winners';

/**
 * Create and configure Express application
 */
export function createApp(env: Env): express.Application {
  const app = express();

  // ==================== Middleware ====================

  // Parse JSON bodies
  app.use(express.json({ limit: '1mb' }));

  // Parse URL-encoded bodies
  app.use(express.urlencoded({ extended: true }));

  // Request logging middleware
  app.use((req: Request, res: Response, next: NextFunction) => {
    const start = Date.now();
    logger.setRequestId(generateRequestId());
    logger.logRequest(req.method, req.path);

    // Log response on finish
    res.on('finish', () => {
      const duration = Date.now() - start;
      logger.logResponse(res.statusCode, duration);
    });

    next();
  });

  // CORS middleware
  app.use((req: Request, res: Response, next: NextFunction) => {
    const allowedOrigins = [
      'http://localhost:5173', // Frontend dev server
      'http://localhost:3000', // Backend dev server
    ];

    const origin = req.headers.origin;
    if (origin && allowedOrigins.includes(origin)) {
      res.setHeader('Access-Control-Allow-Origin', origin);
    }

    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, X-Admin-Secret');
    res.setHeader('Access-Control-Max-Age', '86400');

    if (req.method === 'OPTIONS') {
      res.sendStatus(204);
      return;
    }

    next();
  });

  // Store env in app locals for access in routes
  app.locals.env = env;

  // ==================== Routes ====================

  // Health check
  app.use('/health', healthRouter);

  // API routes
  app.use('/api/v1/tickets', ticketsRouter);
  app.use('/api/v1/results', resultsRouter);
  app.use('/api/v1/winners', winnersRouter);

  // Root endpoint
  app.get('/', (_req: Request, res: Response) => {
    res.json({
      name: 'Hệ Thống Theo Dõi Xổ Số Max 3D+',
      version: '1.0.0',
      endpoints: {
        health: '/health',
        tickets: '/api/v1/tickets',
        results: '/api/v1/results',
        winners: '/api/v1/winners',
      },
    });
  });

  // ==================== Error Handling ====================

  // 404 handler
  app.use((_req: Request, res: Response) => {
    const response: ApiResponse<never> = {
      success: false,
      error: {
        code: 'NOT_FOUND',
        message: 'Endpoint không tồn tại',
      },
    };
    res.status(404).json(response);
  });

  // Global error handler
  app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
    logger.error('Unhandled error', err);

    const response: ApiResponse<never> = {
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Lỗi hệ thống nội bộ',
      },
    };
    res.status(500).json(response);
  });

  return app;
}

/**
 * Generate a simple request ID
 */
function generateRequestId(): string {
  return `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
}
