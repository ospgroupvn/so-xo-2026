// Cloudflare Worker Entry Point
// Handles both HTTP requests and scheduled cron triggers

import express from 'express';
import type { Env } from './types/entities';
import { createApp } from './app';
import { logger } from './utils/logger';
import { checkKvHealth } from './services/kv';

// ==================== HTTP Handler ====================

/**
 * Main HTTP handler for Cloudflare Workers
 */
const handler = {
  async fetch(request: Request, env: Env, _ctx: ExecutionContext): Promise<Response> {
    // Set logger context
    logger.setContext({ environment: env.ENVIRONMENT });

    try {
      const app = createApp(env);

      // Convert Express app to fetch handler
      return await handleRequest(app, request);
    } catch (error) {
      logger.error('Failed to handle request', error);
      return new Response(
        JSON.stringify({
          success: false,
          error: { code: 'INTERNAL_ERROR', message: 'Lỗi hệ thống nội bộ' },
        }),
        {
          status: 500,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }
  },

  // ==================== Scheduled Handler ====================

  /**
   * Cron trigger handler for scheduled jobs
   * Triggered at 18:10 GMT+7 (11:10 UTC) on Wednesdays and Saturdays
   */
  async scheduled(event: ScheduledEvent, env: Env, _ctx: ExecutionContext): Promise<void> {
    logger.setContext({ environment: env.ENVIRONMENT, cron: event.cron });
    logger.info('Scheduled job triggered', {
      scheduledTime: new Date(event.scheduledTime).toISOString(),
      cron: event.cron,
    });

    try {
      // Start the fetch cycle for lottery results
      await startFetchCycle(env);
    } catch (error) {
      logger.error('Scheduled job failed', error);
    }
  },
};

export default handler;

// ==================== Helper Functions ====================

/**
 * Handle HTTP request using Express app
 */
async function handleRequest(app: express.Application, request: Request): Promise<Response> {
  const url = new URL(request.url);

  // Create a mock Node.js request/response for Express
  return new Promise((resolve, reject) => {
    const req = {
      method: request.method,
      url: url.pathname + url.search,
      headers: Object.fromEntries(request.headers.entries()),
      body: null as unknown,
    };

    // Get body for methods that have one
    if (['POST', 'PUT', 'PATCH'].includes(request.method)) {
      request.text().then((body) => {
        req.body = body;
        processRequest();
      });
    } else {
      processRequest();
    }

    function processRequest() {
      let responseBody = '';
      let statusCode = 200;
      const responseHeaders: Record<string, string> = {};

      const res = {
        status: (code: number) => {
          statusCode = code;
          return res;
        },
        json: (data: unknown) => {
          responseBody = JSON.stringify(data);
          responseHeaders['Content-Type'] = 'application/json';
          return res;
        },
        sendStatus: (code: number) => {
          statusCode = code;
          return res;
        },
        setHeader: (name: string, value: string) => {
          responseHeaders[name] = value;
          return res;
        },
        end: (data?: string) => {
          if (data) responseBody = data;
          resolve(
            new Response(responseBody, {
              status: statusCode,
              headers: responseHeaders,
            })
          );
        },
      };

      // Route through Express
      app(req as express.Request, res as express.Response, (err?: unknown) => {
        if (err) {
          reject(err);
        } else {
          resolve(
            new Response(responseBody, {
              status: statusCode,
              headers: responseHeaders,
            })
          );
        }
      });
    }
  });
}

/**
 * Start fetch cycle for lottery results
 * Polls xskt.com.vn until all 20 numbers are fetched
 */
async function startFetchCycle(env: Env): Promise<void> {
  logger.info('Starting fetch cycle for lottery results');

  // Check KV health
  const kvHealth = await checkKvHealth(env.KV);
  if (kvHealth === 'disconnected') {
    logger.error('KV storage not available');
    return;
  }

  // The actual fetch logic will be implemented in the scraper service
  // For now, this is a placeholder that will be connected to the scheduler
  const maxAttempts = 60; // 60 minutes max
  const pollInterval = 60000; // 1 minute

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    logger.info(`Fetch attempt ${attempt}/${maxAttempts}`);

    // TODO: Import and call scraper service
    // const result = await fetchResults(env);
    // if (result.complete) break;

    if (attempt < maxAttempts) {
      await sleep(pollInterval);
    }
  }

  logger.info('Fetch cycle completed');
}

/**
 * Sleep utility
 */
function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
