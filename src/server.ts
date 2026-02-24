// Local Development Server
// Simple Express server for local testing (not Cloudflare Workers)

import express from 'express';

// Import routes
import { healthRouter } from './routes/health';
import { ticketsRouter } from './routes/tickets';
import { resultsRouter } from './routes/results';
import { winnersRouter } from './routes/winners';

const app = express();
const PORT = process.env.PORT || 3000;

// Mock KV storage for local development
const mockKV: KVNamespace = {
  get: async (key: string) => {
    console.log(`[MockKV] GET ${key}`);
    return null;
  },
  put: async (key: string, value: string) => {
    console.log(`[MockKV] PUT ${key}`);
    return undefined;
  },
  delete: async (key: string) => {
    console.log(`[MockKV] DELETE ${key}`);
    return undefined;
  },
  list: async () => {
    console.log(`[MockKV] LIST`);
    return { keys: [], list_complete: true, cursor: '' };
  },
} as unknown as KVNamespace;

// Mock environment
const env = {
  KV: mockKV,
  ENVIRONMENT: 'development',
  ADMIN_SECRET: process.env.ADMIN_SECRET || 'dev-secret',
  LARK_WEBHOOK_URL: process.env.LARK_WEBHOOK_URL,
};

// Middleware - Simple CORS
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, X-Admin-Secret');
  if (req.method === 'OPTIONS') {
    res.sendStatus(204);
    return;
  }
  next();
});
app.use(express.json());

// Store env in app locals
app.locals.env = env;

// Routes
app.use('/health', healthRouter);
app.use('/api/v1/tickets', ticketsRouter);
app.use('/api/v1/results', resultsRouter);
app.use('/api/v1/winners', winnersRouter);

// Root endpoint
app.get('/', (_req, res) => {
  res.json({
    name: 'Hệ Thống Theo Dõi Xổ Số Max 3D+',
    version: '1.0.0',
    environment: 'development',
    endpoints: {
      health: '/health',
      tickets: '/api/v1/tickets',
      results: '/api/v1/results',
      winners: '/api/v1/winners',
    },
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
  console.log(`📋 Health: http://localhost:${PORT}/health`);
  console.log(`🎫 Tickets: http://localhost:${PORT}/api/v1/tickets`);
});

export { app };
