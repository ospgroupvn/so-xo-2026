// Admin Auth Middleware
// Validates X-Admin-Secret header for protected routes

import type { Request, Response, NextFunction } from 'express';
import type { Env, ApiResponse } from '../types/entities';
import { logger } from '../utils/logger';

/**
 * Middleware to validate admin secret for protected operations
 * Checks X-Admin-Secret header against ADMIN_SECRET environment variable
 */
export function requireAdminAuth(req: Request, res: Response, next: NextFunction): void {
  const env: Env = req.app.locals.env;
  const providedSecret = req.headers['x-admin-secret'];
  const adminSecret = env.ADMIN_SECRET;

  // Check if admin secret is configured
  if (!adminSecret) {
    logger.error('Admin secret not configured in environment');
    const response: ApiResponse<never> = {
      success: false,
      error: {
        code: 'SERVER_MISCONFIGURED',
        message: 'Server không được cấu hình đúng',
      },
    };
    res.status(500).json(response);
    return;
  }

  // Check if secret was provided
  if (!providedSecret) {
    logger.warn('Admin auth attempt without secret', { path: req.path });
    const response: ApiResponse<never> = {
      success: false,
      error: {
        code: 'UNAUTHORIZED',
        message: 'Thiếu mật mã admin',
      },
    };
    res.status(401).json(response);
    return;
  }

  // Validate secret (constant-time comparison)
  const provided = typeof providedSecret === 'string' ? providedSecret : '';
  if (!timingSafeEqual(provided, adminSecret)) {
    logger.warn('Invalid admin secret provided', { path: req.path });
    const response: ApiResponse<never> = {
      success: false,
      error: {
        code: 'UNAUTHORIZED',
        message: 'Mật mã admin không hợp lệ',
      },
    };
    res.status(401).json(response);
    return;
  }

  logger.info('Admin auth successful', { path: req.path });
  next();
}

/**
 * Constant-time string comparison to prevent timing attacks
 */
export function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) {
    return false;
  }

  let result = 0;
  for (let i = 0; i < a.length; i++) {
    result |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return result === 0;
}
