# Implementation Plan: Hệ Thống Theo Dõi Xổ Số Max 3D+

**Branch**: `001-lottery-tracker` | **Date**: 2026-02-23 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/001-lottery-tracker/spec.md`

## Summary

Xây dựng hệ thống theo dõi kết quả xổ số Max 3D+ với các tính năng:

- Đăng ký vé số (2 bộ số, mỗi bộ 3 chữ số)
- Cập nhật/xóa vé số (cần ADMIN_SECRET)
- Tự động lấy kết quả từ https://xskt.com.vn/xsmax3d vào 18h10 (GMT+7) các ngày quay số
- So khớp và thông báo trúng giải qua Lark webhook
- Dashboard thời gian thực hiển thị kết quả và vé số

**Technical approach**: Node.js/Express application deployed trên Cloudflare Workers với Cron Triggers cho scheduled jobs, Cloudflare KV cho storage, React frontend với HTTP polling cho real-time updates.

## Technical Context

**Language/Version**: Node.js 20.x (LTS), TypeScript 5.x

**Primary Dependencies**:
- Backend: Express.js, cheerio (HTML parsing), wrangler (Cloudflare CLI)
- Frontend: React 18, shadcn/ui (InputOTP component), tailwindcss, lucide-react

**Storage**: Cloudflare Workers KV (serverless key-value store)

**Testing**: Vitest (backend), React Testing Library (frontend), MSW (API mocking)

**Target Platform**: Web application (browser), Cloudflare Workers (edge runtime)

**Project Type**: Web application (frontend + backend)

**Performance Goals**:
- Dashboard polling: 5-10 giây interval
- Webhook notification: <10 giây sau khi phát hiện trúng giải
- Lấy đủ 20 cặp số kết quả: <15 phút từ 18h10 GMT+7

**Constraints**:
- Cloudflare KV TTL: 24h cho dữ liệu tạm
- Cloudflare Workers Cron Triggers với cron expression
- HTTP polling (không WebSocket)
- ADMIN_SECRET required cho update/delete operations

**Scale/Scope**: <100 users, <500 tickets, 1 draw/2 days

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Status | Evidence |
|-----------|--------|----------|
| I. Test-First Development | ✅ PASS | Plan includes Vitest + RTL setup; tests written before implementation |
| II. Real-Time User Experience | ✅ PASS | HTTP polling 5-10s interval; dashboard updates real-time |
| III. Intuitive Data Entry | ✅ PASS | shadcn/ui InputOTP component với keyboard navigation |
| IV. Transparent Data Handling | ✅ PASS | Public dashboard; secrets stored in Cloudflare KV |
| V. Cloud-Native Architecture | ✅ PASS | Node.js/Express deployed on Cloudflare Workers với Cron Triggers |

**Gate Resolution**: Constitution V fully satisfied. Application deployed on Cloudflare Workers with native KV binding and Cron Triggers.

## Project Structure

### Documentation (this feature)

```text
specs/001-lottery-tracker/
├── plan.md              # This file (/speckit.plan command output)
├── research.md          # Phase 0 output (/speckit.plan command)
├── data-model.md        # Phase 1 output (/speckit.plan command)
├── quickstart.md        # Phase 1 output (/speckit.plan command)
├── contracts/           # Phase 1 output (/speckit.plan command)
│   ├── api.md           # REST API contracts
│   └── webhook.md       # Lark webhook contract
└── tasks.md             # Phase 2 output (/speckit.tasks command - NOT created by /speckit.plan)
```

### Source Code (repository root)

```text
src/
├── index.ts                  # Cloudflare Worker entry point
├── app.ts                    # Express application
├── routes/
│   ├── tickets.ts            # Ticket CRUD API (create, update, delete)
│   ├── results.ts            # Draw results API
│   ├── winners.ts            # Winners list API
│   └── health.ts             # Health check endpoint
├── services/
│   ├── kv.ts                 # Cloudflare KV operations (native binding)
│   ├── scraper.ts            # xskt.com.vn HTML scraper
│   ├── matcher.ts            # Prize matching logic
│   ├── notifier.ts           # Lark webhook notification
│   └── scheduler.ts          # Cron trigger handler
├── middleware/
│   └── adminAuth.ts          # Admin secret validation
├── models/
│   ├── ticket.ts             # Ticket entity
│   ├── drawResult.ts         # DrawResult entity
│   └── winNotification.ts    # WinNotification entity
└── utils/
    ├── validation.ts         # Input validation helpers
    └── logger.ts             # Logging utility

tests/
├── unit/
│   ├── matcher.test.ts       # Prize matching logic tests
│   ├── validation.test.ts    # Input validation tests
│   └── scraper.test.ts       # HTML parsing tests
└── integration/
    ├── tickets.test.ts       # Ticket API integration tests
    ├── results.test.ts       # Results API integration tests
    └── auth.test.ts          # Admin auth tests

frontend/
├── src/
│   ├── App.tsx               # Main application
│   ├── pages/
│   │   ├── RegisterPage.tsx  # Ticket registration page
│   │   ├── DashboardPage.tsx # Results dashboard page
│   │   └── AdminPage.tsx     # Admin page (update/delete tickets)
│   ├── components/
│   │   ├── ui/               # shadcn/ui components
│   │   │   └── input-otp.tsx # InputOTP from shadcn
│   │   ├── TicketInput.tsx   # Ticket input using InputOTP
│   │   ├── TicketCard.tsx    # Ticket display card
│   │   ├── ResultDisplay.tsx # Draw result display
│   │   ├── WinnerHighlight.tsx # Winner animation/highlight
│   │   └── ProgressIndicator.tsx # Fetch progress indicator
│   ├── services/
│   │   └── api.ts            # API client
│   └── hooks/
│       └── usePolling.ts     # HTTP polling hook
├── tests/
│   ├── components/
│   │   ├── TicketInput.test.tsx
│   │   └── TicketCard.test.tsx
│   └── hooks/
│       └── usePolling.test.ts
├── package.json
├── tsconfig.json
├── vite.config.ts
├── tailwind.config.js
└── components.json           # shadcn/ui config

wrangler.toml                 # Cloudflare Workers configuration
.env.example                  # Environment variables template
```

**Structure Decision**: Single project structure with src/ for Cloudflare Workers backend and frontend/ for React SPA. Backend deployed on Cloudflare Workers with native KV binding and Cron Triggers. Frontend deployed on Cloudflare Pages.

## Complexity Tracking

> No violations - Constitution fully satisfied
