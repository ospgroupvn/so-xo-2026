# Quickstart: Hệ Thống Theo Dõi Xổ Số Max 3D+

Hướng dẫn nhanh để bắt đầu phát triển và chạy hệ thống.

## Prerequisites

- Node.js 20.x (LTS)
- pnpm (recommended) hoặc npm
- Cloudflare account với KV enabled
- Lark account với webhook URL

## Initial Setup

### 1. Clone và cài đặt dependencies

```bash
# Clone repository
git clone <repo-url>
cd so-xo-2026

# Cài đặt dependencies cho backend
cd backend
pnpm install

# Cài đặt dependencies cho frontend
cd ../frontend
pnpm install
```

### 2. Cấu hình Environment Variables

Tạo file `.env` trong thư mục `backend/`:

```bash
# Cloudflare KV Configuration
CF_ACCOUNT_ID=your_cloudflare_account_id
CF_NAMESPACE_ID=your_kv_namespace_id
CF_API_TOKEN=your_cloudflare_api_token

# Lark Webhook
LARK_WEBHOOK_URL=https://open.larksuite.com/open-apis/bot/v2/hook/xxx

# Server Configuration
PORT=3000
NODE_ENV=development
```

### 3. Tạo Cloudflare KV Namespace

```bash
# Đăng nhập Cloudflare (nếu chưa)
wrangler login

# Tạo KV namespace
wrangler kv:namespace create "SO_KHOP_XO_SO"

# Copy namespace ID vào .env file
```

## Development

### Chạy Backend

```bash
cd backend

# Development mode với hot reload
pnpm dev

# Server sẽ chạy tại http://localhost:3000
```

### Chạy Frontend

```bash
cd frontend

# Development mode
pnpm dev

# Frontend sẽ chạy tại http://localhost:5173
```

### Chạy Tests

```bash
# Backend tests
cd backend
pnpm test

# Backend tests với watch mode
pnpm test:watch

# Frontend tests
cd frontend
pnpm test
```

## API Quick Reference

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/health` | GET | Health check |
| `/api/v1/tickets` | POST | Đăng ký vé số |
| `/api/v1/tickets` | GET | Danh sách vé số |
| `/api/v1/results/today` | GET | Kết quả hôm nay |
| `/api/v1/results/:date` | GET | Kết quả theo ngày |
| `/api/v1/results/fetch` | POST | Trigger fetch thủ công |
| `/api/v1/winners` | GET | Danh sách trúng giải |

Chi tiết đầy đủ: [contracts/api.md](./contracts/api.md)

## Testing Workflow

### 1. Test Đăng Ký Vé Số

```bash
curl -X POST http://localhost:3000/api/v1/tickets \
  -H "Content-Type: application/json" \
  -d '{"name": "Test User", "numbers": ["123", "456"]}'
```

### 2. Test Fetch Kết Quả (Manual)

```bash
curl -X POST http://localhost:3000/api/v1/results/fetch \
  -H "Content-Type: application/json" \
  -d '{"force": true}'
```

### 3. Test Health Check

```bash
curl http://localhost:3000/health
```

## Scheduled Jobs

Hệ thống sử dụng node-cron để tự động fetch kết quả:

- **Lịch**: 18:10 thứ 4 và thứ 7 hàng tuần (Asia/Ho_Chi_Minh)
- **Cron expression**: `10 18 * * 3,6`

Trong development, có thể trigger thủ công qua API `/api/v1/results/fetch`.

## Deployment

### 1. Build Production

```bash
# Build backend
cd backend
pnpm build

# Build frontend
cd ../frontend
pnpm build
```

### 2. Deploy

```bash
# Deploy backend (tùy chọn platform)
# Option 1: Cloudflare Workers
wrangler deploy

# Option 2: Node.js server
NODE_ENV=production pnpm start

# Deploy frontend (Cloudflare Pages)
cd frontend
pnpm build
wrangler pages deploy dist
```

### 3. Cấu hình Production Secrets

```bash
# Lưu secrets cho production
wrangler secret put LARK_WEBHOOK_URL
wrangler secret put CF_API_TOKEN
```

## Troubleshooting

### KV Connection Error

```
Error: KV namespace not found
```

**Solution**: Kiểm tra `CF_ACCOUNT_ID` và `CF_NAMESPACE_ID` trong `.env`

### Webhook Failed

```
Error: Webhook returned 401
```

**Solution**: Kiểm tra `LARK_WEBHOOK_URL` có đúng format không

### Cron Job Not Running

**Solution**: Trong development, cron jobs không tự chạy. Sử dụng manual trigger `/api/v1/results/fetch`

## Project Structure

```
so-xo-2026/
├── backend/
│   ├── src/
│   │   ├── index.ts
│   │   ├── routes/
│   │   ├── services/
│   │   ├── models/
│   │   └── utils/
│   ├── tests/
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── App.tsx
│   │   ├── pages/
│   │   ├── components/
│   │   ├── services/
│   │   └── hooks/
│   ├── tests/
│   └── package.json
└── specs/
    └── 001-lottery-tracker/
        ├── spec.md
        ├── plan.md
        ├── research.md
        ├── data-model.md
        ├── quickstart.md (this file)
        └── contracts/
```

## Next Steps

1. Chạy `pnpm dev` trong cả backend và frontend
2. Mở http://localhost:5173 để xem UI
3. Test đăng ký vé số qua UI hoặc API
4. Trigger fetch thủ công để test flow hoàn chỉnh
5. Kiểm tra Lark notification

---

**Need help?** Xem thêm documentation:
- [Feature Spec](./spec.md)
- [Implementation Plan](./plan.md)
- [Data Model](./data-model.md)
- [API Contract](./contracts/api.md)
- [Webhook Contract](./contracts/webhook.md)
