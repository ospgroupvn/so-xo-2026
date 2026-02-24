// Cloudflare Worker Entry Point
// Handles both HTTP requests and scheduled cron triggers

import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { logger as honoLogger } from 'hono/logger';
import type { Env } from './types/entities';
import { logger } from './utils/logger';
import { checkKvHealth } from './services/kv';
import {
  registerTicket,
  listTickets,
  getTicketById,
  updateTicketNumbers,
  removeTicket,
} from './services/ticketService';
import {
  validateCreateTicketRequest,
  validateUpdateTicketRequest,
  validatePagination,
} from './utils/validation';
import { matchTicket, getPrizeDisplayName } from './services/matcher';
import { getDrawResult, saveDrawResult } from './services/kv';
import { scrapeResults } from './services/scraper';
import { timingSafeEqual } from './middleware/adminAuth';

// Create Hono app
const app = new Hono<{ Bindings: Env }>();

// Middleware
app.use('*', honoLogger());
app.use('*', cors());

// Health check
app.get('/health', async (c) => {
  const kvStatus = await checkKvHealth(c.env.KV);
  return c.json({
    success: true,
    data: {
      status: 'ok',
      timestamp: new Date().toISOString(),
      services: {
        kv: kvStatus,
        scheduler: 'running',
      },
    },
  });
});

// ==================== Tickets API ====================

// POST /api/v1/tickets - Register new ticket
app.post('/api/v1/tickets', async (c) => {
  const body = await c.req.json();
  const validation = validateCreateTicketRequest(body);

  if (!validation.valid) {
    return c.json(
      {
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Dữ liệu không hợp lệ',
          details: validation.errors,
        },
      },
      400
    );
  }

  const result = await registerTicket(c.env, validation.data!.name, validation.data!.numbers);

  if (result.success) {
    return c.json(result, 201);
  } else if (result.error?.code === 'DUPLICATE_TICKET') {
    return c.json(result, 409);
  } else {
    return c.json(result, 500);
  }
});

// GET /api/v1/tickets - List all tickets
app.get('/api/v1/tickets', async (c) => {
  const query = c.req.query();
  const { page, limit } = validatePagination({
    page: query.page,
    limit: query.limit,
  });

  const result = await listTickets(c.env, page, limit);
  return c.json(result);
});

// GET /api/v1/tickets/:id - Get ticket by ID
app.get('/api/v1/tickets/:id', async (c) => {
  const { id } = c.req.param();
  const result = await getTicketById(c.env, id);

  if (result.success) {
    return c.json(result);
  } else if (result.error?.code === 'TICKET_NOT_FOUND') {
    return c.json(result, 404);
  } else {
    return c.json(result, 500);
  }
});

// PUT /api/v1/tickets/:id - Update ticket (admin only)
app.put('/api/v1/tickets/:id', async (c) => {
  // Check admin auth
  const authResult = checkAdminAuth(c);
  if (authResult) return authResult;

  const { id } = c.req.param();
  const body = await c.req.json();
  const validation = validateUpdateTicketRequest(body);

  if (!validation.valid) {
    return c.json(
      {
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Dữ liệu không hợp lệ',
          details: validation.errors,
        },
      },
      400
    );
  }

  const result = await updateTicketNumbers(c.env, id, validation.data!.numbers);

  if (result.success) {
    return c.json(result);
  } else if (result.error?.code === 'TICKET_NOT_FOUND') {
    return c.json(result, 404);
  } else if (result.error?.code === 'DUPLICATE_TICKET') {
    return c.json(result, 409);
  } else {
    return c.json(result, 500);
  }
});

// DELETE /api/v1/tickets/:id - Delete ticket (admin only)
app.delete('/api/v1/tickets/:id', async (c) => {
  // Check admin auth
  const authResult = checkAdminAuth(c);
  if (authResult) return authResult;

  const { id } = c.req.param();
  const result = await removeTicket(c.env, id);

  if (result.success) {
    return c.json(result);
  } else if (result.error?.code === 'TICKET_NOT_FOUND') {
    return c.json(result, 404);
  } else {
    return c.json(result, 500);
  }
});

// ==================== Results API ====================

// GET /api/v1/results/today - Get today's results
app.get('/api/v1/results/today', async (c) => {
  const today = new Date().toISOString().split('T')[0];
  const result = await getDrawResult(c.env.KV, today);

  if (result) {
    return c.json({ success: true, data: result });
  } else {
    return c.json({
      success: false,
      error: { code: 'RESULT_NOT_FOUND', message: 'Chưa có kết quả cho ngày hôm nay' },
    }, 404);
  }
});

// GET /api/v1/results/:date - Get results by date
app.get('/api/v1/results/:date', async (c) => {
  const { date } = c.req.param();
  const result = await getDrawResult(c.env.KV, date);

  if (result) {
    return c.json({ success: true, data: result });
  } else {
    return c.json({
      success: false,
      error: { code: 'RESULT_NOT_FOUND', message: 'Không tìm thấy kết quả cho ngày này' },
    }, 404);
  }
});

// POST /api/v1/results/fetch - Trigger fetch (admin only)
app.post('/api/v1/results/fetch', async (c) => {
  const authResult = checkAdminAuth(c);
  if (authResult) return authResult;

  const body = await c.req.json().catch(() => ({}));
  const date = body.date || new Date().toISOString().split('T')[0];

  const result = await scrapeResults(date);

  if (result) {
    await saveDrawResult(c.env.KV, result);
    return c.json({ success: true, data: result });
  } else {
    return c.json(
      {
        success: false,
        error: { code: 'FETCH_FAILED', message: 'Không thể lấy kết quả' },
      },
      500
    );
  }
});

// ==================== Winners API ====================

// GET /api/v1/winners - Get all winners for a date
app.get('/api/v1/winners', async (c) => {
  const date = c.req.query('date') || new Date().toISOString().split('T')[0];

  // Get tickets and results
  const ticketsResult = await listTickets(c.env, 1, 1000);
  const results = await getDrawResult(c.env.KV, date);

  const winners: Array<{
    ticketId: string;
    participantName: string;
    numbers: [string, string];
    prize: string;
    prizeName: string;
  }> = [];

  if (ticketsResult.success && results) {
    const tickets = ticketsResult.data!.tickets;

    if (results.status === 'complete') {
      for (const ticket of tickets) {
        const prize = matchTicket(ticket, results);
        if (prize) {
          winners.push({
            ticketId: ticket.id,
            participantName: ticket.participantName,
            numbers: ticket.numbers,
            prize: prize,
            prizeName: getPrizeDisplayName(prize),
          });
        }
      }
    }
  }

  return c.json({
    success: true,
    data: {
      date,
      winners,
      summary: {
        total: winners.length,
      },
    },
  });
});

// ==================== Admin Auth Helper ====================

function checkAdminAuth(c: { env: Env; req: { header: (name: string) => string | undefined } }) {
  const providedSecret = c.req.header('X-Admin-Secret');
  const adminSecret = c.env.ADMIN_SECRET;

  if (!adminSecret) {
    return c.json(
      {
        success: false,
        error: { code: 'SERVER_MISCONFIGURED', message: 'Server không được cấu hình đúng' },
      },
      500
    );
  }

  if (!providedSecret) {
    return c.json(
      {
        success: false,
        error: { code: 'UNAUTHORIZED', message: 'Thiếu mật mã admin' },
      },
      401
    );
  }

  if (!timingSafeEqual(providedSecret, adminSecret)) {
    return c.json(
      {
        success: false,
        error: { code: 'UNAUTHORIZED', message: 'Mật mã admin không hợp lệ' },
      },
      401
    );
  }

  return null;
}

// ==================== Export Handler ====================

export default {
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    logger.setContext({ environment: env.ENVIRONMENT });
    return app.fetch(request, env, ctx);
  },

  async scheduled(event: ScheduledEvent, env: Env, _ctx: ExecutionContext): Promise<void> {
    logger.setContext({ environment: env.ENVIRONMENT, cron: event.cron });
    logger.info('Scheduled job triggered', {
      scheduledTime: new Date(event.scheduledTime).toISOString(),
      cron: event.cron,
    });

    try {
      // Start the fetch cycle for lottery results
      const maxAttempts = 60;
      const pollInterval = 60000; // 1 minute

      for (let attempt = 1; attempt <= maxAttempts; attempt++) {
        logger.info(`Fetch attempt ${attempt}/${maxAttempts}`);

        const result = await scrapeResults();
        if (result && result.status === 'complete') {
          await saveDrawResult(env.KV, result);
          logger.info('Results fetched and saved successfully');
          break;
        }

        if (attempt < maxAttempts) {
          await new Promise((resolve) => setTimeout(resolve, pollInterval));
        }
      }

      logger.info('Fetch cycle completed');
    } catch (error) {
      logger.error('Scheduled job failed', error);
    }
  },
};
