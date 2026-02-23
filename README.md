# Hệ Thống Theo Dõi Xổ Số Max 3D+

Hệ thống theo dõi kết quả xổ số Max 3D+ với các tính năng:

- **Đăng ký vé số**: Người dùng có thể nhập tên và 2 bộ số vé Max 3D+ (mỗi bộ 3 chữ số)
- **Tự động lấy kết quả**: Hệ thống tự động fetch kết quả từ xskt.com.vn vào 18h10 GMT+7
- **So khớp và thông báo**: Tự động so khớp vé với kết quả, gửi webhook Lark khi có người trúng
- **Dashboard thời gian thực**: Hiển thị tất cả vé, kết quả, và winners với real-time updates

## Công nghệ

- **Backend**: Node.js 20.x + Express + TypeScript
- **Frontend**: React 18 + Vite + TypeScript + Tailwind CSS
- **Deployment**: Cloudflare Workers với KV storage và Cron Triggers
- **Testing**: Vitest + React Testing Library

## Cấu trúc dự án

```
so-xo-2026/
├── src/                    # Backend source code
│   ├── index.ts            # Cloudflare Worker entry point
│   ├── app.ts              # Express application
│   ├── routes/             # API routes
│   ├── services/           # Business logic
│   ├── models/             # Entity factories
│   ├── middleware/         # Express middleware
│   ├── types/              # TypeScript types
│   └── utils/              # Utility functions
├── frontend/               # Frontend source code
│   ├── src/
│   │   ├── App.tsx         # Main application
│   │   ├── pages/          # Page components
│   │   ├── components/     # Reusable components
│   │   ├── services/       # API client
│   │   └── hooks/          # React hooks
│   └── tests/              # Frontend tests
├── tests/                  # Backend tests
└── specs/                  # Feature specifications
```

## API Endpoints

| Endpoint | Method | Mô tả |
|----------|--------|-------|
| `/health` | GET | Health check |
| `/api/v1/tickets` | POST | Đăng ký vé số mới |
| `/api/v1/tickets` | GET | Danh sách vé số |
| `/api/v1/tickets/:id` | PUT | Cập nhật vé số (admin) |
| `/api/v1/tickets/:id` | DELETE | Xóa vé số (admin) |
| `/api/v1/results/today` | GET | Kết quả hôm nay |
| `/api/v1/results/:date` | GET | Kết quả theo ngày |
| `/api/v1/results/fetch` | POST | Trigger fetch thủ công |
| `/api/v1/winners` | GET | Danh sách người trúng giải |

## Cài đặt và Chạy

### Prerequisites

- Node.js 20.x
- pnpm (recommended) hoặc npm

### Development

```bash
# Cài đặt backend dependencies
pnpm install

# Cài đặt frontend dependencies
cd frontend && pnpm install && cd ..

# Chạy backend development server
pnpm dev

# Chạy frontend development server (terminal khác)
cd frontend && pnpm dev
```

### Testing

```bash
# Backend tests
pnpm test

# Frontend tests
cd frontend && pnpm test
```

### Deployment

```bash
# Deploy to Cloudflare Workers
pnpm deploy

# Deploy frontend to Cloudflare Pages
cd frontend && pnpm build && wrangler pages deploy dist
```

## Environment Variables

Xem file `.env.example` để biết các biến môi trường cần thiết.

## Luật Giải Thưởng Max 3D+

| Giải | Điều kiện trúng |
|------|-----------------|
| Giải nhất | Trùng cả 2 bộ với cặp giải nhất |
| Giải nhì | Trùng cả 2 bộ với bất kỳ cặp giải nhì |
| Giải ba | Trùng cả 2 bộ với bất kỳ cặp giải ba |
| Giải tư | Trùng cả 2 bộ với bất kỳ cặp giải tư |
| Giải năm | Trùng cả 2 bộ với bất kỳ cặp trong 20 cặp |
| Giải sáu | Trùng 1 bộ với cặp giải nhất |
| Giải bảy | Trùng 1 bộ với bất kỳ cặp trong giải nhì/ba/tư |

## License

MIT
