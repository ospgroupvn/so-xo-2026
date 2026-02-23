# Research: Hệ Thống Theo Dõi Xổ Số Max 3D+

**Date**: 2026-02-23
**Feature**: 001-lottery-tracker

## Research Items

### 1. Node.js + Cloudflare Deployment

**Decision**: Triển khai Node.js/Express application trên Cloudflare Workers sử dụng compatibility layer.

**Rationale**:

- Đáp ứng Constitution V (Cloud-Native Architecture)
- Node.js code có thể chạy trên Cloudflare Workers với adapter
- Tận dụng được Cloudflare KV native binding
- Global distribution với edge computing

**Alternatives considered**:

- **Node.js trên VPS/VM**: Không đáp ứng Constitution V (Cloud-Native)
- **Cloudflare Workers thuần**: Không hỗ trợ node-cron, cần dùng Cron Triggers + Durable Objects (phức tạp hơn)

**Implementation** (từ Context7 Cloudflare docs):

```typescript
import { env } from "cloudflare:workers";
import { httpServerHandler } from "cloudflare:node";
import express from "express";

const app = express();

// Middleware to parse JSON bodies
app.use(express.json());

// Health check endpoint
app.get("/", (req, res) => {
  res.json({ message: "Express.js running on Cloudflare Workers!" });
});

// Routes
app.post("/api/v1/tickets", handleCreateTicket);
app.get("/api/v1/results/today", handleGetResults);

app.listen(3000);
export default httpServerHandler({ port: 3000 });
```

**wrangler.toml configuration**:

```toml
name = "so-khop-xo-so"
main = "src/index.ts"
compatibility_date = "2024-01-01"
node_compat = true

[[kv_namespaces]]
binding = "KV"
id = "your-kv-namespace-id"

[vars]
ENVIRONMENT = "production"

# Secrets (set via: wrangler secret put ADMIN_SECRET)
# ADMIN_SECRET = "your-admin-password"
# LARK_WEBHOOK_URL = "your-webhook-url"
```

**Deployment commands**:

```bash
# Local development
wrangler dev

# Deploy to production
wrangler deploy

# View logs
wrangler tail
```

---

### 2. HTML Scraping Strategy for xskt.com.vn

**Decision**: Sử dụng `cheerio` để parse HTML từ https://xskt.com.vn/xsmax3d, extract class "box-ketqua".

**Rationale**:

- cheerio là lightweight, fast, và có jQuery-like syntax quen thuộc
- HTML parsing phía server (backend) đảm bảo consistency
- Có thể cache kết quả để tránh repeated requests

**Alternatives considered**:

- **Puppeteer/Playwright**: Overkill cho static HTML parsing, tốn resources
- **Regex**: Fragile, dễ break khi HTML thay đổi

**HTML Structure Research** (cần verify khi implement):

```html
<div class="box-ketqua">
  <!-- Cần fetch thực tế để xác định cấu trúc chi tiết -->
  <!-- Dự kiến: các thẻ chứa số kết quả theo giải -->
</div>
```

**Implementation**:

```typescript
import * as cheerio from 'cheerio';

async function scrapeResults(): Promise<string[]> {
  const response = await fetch('https://xskt.com.vn/xsmax3d');
  const html = await response.text();
  const $ = cheerio.load(html);

  const results: string[] = [];
  $('.box-ketqua').first().find('.so-ket-qua').each((_, el) => {
    results.push($(el).text().trim());
  });

  return results;
}
```

**Risk Mitigation**: HTML structure có thể thay đổi. Cần:

1. Logging để detect changes
2. Fallback alerting khi parse fails
3. Manual fetch trigger để test

---

### 3. Prize Matching Logic (Luật Giải Thưởng Max 3D+)

**Decision**: Implement prize matching theo luật chính thức của Max 3D+.

**Rationale**: Logic phức tạp cần được test kỹ với nhiều test cases.

#### Định nghĩa thuật ngữ

| Thuật ngữ | Định nghĩa |
|-----------|-----------|
| **Bộ số** | Một bộ gồm 3 chữ số (000-999). Ví dụ: `123`, `456`, `000` |
| **Vé số** | Một vé Max 3D+ gồm **2 bộ số** (6 chữ số). Ví dụ: `123 456` |
| **Số quay thưởng** | Kết quả quay được từ xổ số, cũng gồm 6 chữ số chia thành 2 bộ |
| **Cặp số quay** | Một cặp kết quả = 2 bộ số (6 chữ số). Mỗi giải có số lượng cặp khác nhau |

#### Luật giải thưởng chi tiết

Khi quay thưởng, mỗi giải sẽ quay ra một số lượng **cặp số** khác nhau:

| Giải | Số cặp được quay | Điều kiện trúng |
|------|------------------|-----------------|
| **Nhất** | 1 cặp (2 bộ) | Vé trùng **cả 2 bộ** với cặp giải nhất |
| **Nhì** | 2 cặp (4 bộ) | Vé trùng **cả 2 bộ** với bất kỳ cặp giải nhì |
| **Ba** | 3 cặp (6 bộ) | Vé trùng **cả 2 bộ** với bất kỳ cặp giải ba |
| **Tư** | 4 cặp (8 bộ) | Vé trùng **cả 2 bộ** với bất kỳ cặp giải tư |
| **Năm** | 20 cặp (40 bộ) | Vé trùng **cả 2 bộ** với bất kỳ cặp nào trong 20 cặp |
| **Sáu** | - | Vé trùng **1 bộ** (chỉ 1 trong 2) với cặp giải nhất |
| **Bảy** | - | Vé trùng **1 bộ** với bất kỳ cặp nào trong giải nhì/ba/tư (tổng 9 cặp = 18 bộ) |

#### Ví dụ minh họa

Giả sử:
- **Vé của bạn**: `123 456` (2 bộ: `123` và `456`)
- **Giải nhất quay**: `123 456` → **TRÚNG GIẢI NHẤT** (trùng cả 2 bộ)
- **Giải nhì quay**: `123 789` và `456 111` → **TRÚNG GIẢI SÁU** (trùng 1 bộ với giải nhất)

**Implementation**:

```typescript
function matchPrize(ticket: Ticket, drawResult: DrawResult): Prize | null {
  const [t1, t2] = ticket.numbers; // 2 bộ số của vé

  // Giải nhất: trùng cả 2 bộ với cặp giải nhất
  if (matchesPair(t1, t2, drawResult.first)) {
    return Prize.FIRST;
  }

  // Giải nhì: trùng cả 2 bộ với bất kỳ cặp giải nhì
  for (const pair of drawResult.second) {
    if (matchesPair(t1, t2, pair)) return Prize.SECOND;
  }

  // Giải ba: trùng cả 2 bộ với bất kỳ cặp giải ba
  for (const pair of drawResult.third) {
    if (matchesPair(t1, t2, pair)) return Prize.THIRD;
  }

  // Giải tư: trùng cả 2 bộ với bất kỳ cặp giải tư
  for (const pair of drawResult.fourth) {
    if (matchesPair(t1, t2, pair)) return Prize.FOURTH;
  }

  // Giải năm: trùng cả 2 bộ với bất kỳ cặp trong toàn bộ 20 cặp
  const allPairs = drawResult.getAllPairs();
  for (const pair of allPairs) {
    if (matchesPair(t1, t2, pair)) return Prize.FIFTH;
  }

  // Giải sáu: trùng 1 bộ với cặp giải nhất
  if (matchesOneInPair(t1, t2, drawResult.first)) {
    return Prize.SIXTH;
  }

  // Giải bảy: trùng 1 bộ với bất kỳ cặp trong giải nhì/ba/tư
  const secondaryPairs = [...drawResult.second, ...drawResult.third, ...drawResult.fourth];
  for (const pair of secondaryPairs) {
    if (matchesOneInPair(t1, t2, pair)) return Prize.SEVENTH;
  }

  return null;
}

// Helper functions
function matchesPair(t1: string, t2: string, pair: [string, string]): boolean {
  // Trùng cả 2 bộ (không quan tâm thứ tự)
  return (t1 === pair[0] && t2 === pair[1]) ||
         (t1 === pair[1] && t2 === pair[0]);
}

function matchesOneInPair(t1: string, t2: string, pair: [string, string]): boolean {
  // Trùng ít nhất 1 bộ
  return [t1, t2].some(t => pair.includes(t));
}
```

---

### 4. node-cron Scheduled Job Setup (Cloudflare Workers)

**Decision**: Sử dụng Cloudflare Workers Cron Triggers kết hợp với node-cron fallback.

**Rationale**:

- Cloudflare Workers Cron Triggers là native solution cho scheduled jobs
- Không cần giữ server running 24/7
- Tự động scale và highly available

**Lịch quay số Max 3D+**: Mỗi thứ 4 và thứ 7 hàng tuần.

**wrangler.toml Cron Triggers**:

```toml
[triggers]
crons = ["10 11 * * 3,6"]  # 11:10 UTC = 18:10 GMT+7 thứ 4 và thứ 7
```

**Implementation**:

```typescript
// src/index.ts
export default {
  async scheduled(event: ScheduledEvent, env: Env, ctx: ExecutionContext): Promise<void> {
    // Cron trigger handler
    await startFetchCycle(env);
  },

  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    // HTTP handler cho API endpoints
    return app.fetch(request, env, ctx);
  }
};

async function startFetchCycle(env: Env): Promise<void> {
  const maxAttempts = 60; // 60 phút max
  let attempts = 0;

  while (attempts < maxAttempts) {
    const results = await scrapeResults();

    if (results.length >= 20) {
      await saveResults(results, env.KV);
      await matchAllTickets(results, env);
      break;
    }

    // Poll mỗi 1 phút (sử dụng setTimeout hoặc gọi lại qua API)
    await sleep(60000);
    attempts++;
  }
}
```

---

### 5. Lark Webhook Notification

**Decision**: Sử dụng HTTP POST đến Lark webhook URL khi phát hiện trúng giải.

**Rationale**:

- Lark webhook API đơn giản, chỉ cần POST JSON
- Webhook URL được lưu trong Cloudflare KV secrets

**Message Format**:

```json
{
  "msg_type": "interactive",
  "card": {
    "header": {
      "title": {
        "tag": "plain_text",
        "content": "🎊 CHÚC MỪNG TRÚNG GIẢI!"
      },
      "template": "green"
    },
    "elements": [
      {
        "tag": "div",
        "text": {
          "tag": "lark_md",
          "content": "**Người trúng giải:** Nguyễn Văn A\n**Giải thưởng:** Giải Nhất\n**Vé số:** 123 456"
        }
      }
    ]
  }
}
```

**Implementation**:

```typescript
async function sendWinNotification(notification: WinNotification, env: Env): Promise<void> {
  const webhookUrl = env.LARK_WEBHOOK_URL;

  await fetch(webhookUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      msg_type: 'interactive',
      card: formatNotificationCard(notification)
    })
  });
}
```

---

### 6. HTTP Polling for Real-Time Dashboard

**Decision**: Frontend polls backend API mỗi 5-10 giây để lấy kết quả mới.

**Rationale**:

- Đơn giản hơn WebSocket cho quy mô nhỏ (<100 users)
- Spec đã xác định "request polling"
- Ít complexity hơn SSE cho use case này

**Implementation**:

```typescript
// Frontend hook
function usePolling<T>(url: string, interval: number = 5000): T | null {
  const [data, setData] = useState<T | null>(null);

  useEffect(() => {
    const poll = async () => {
      const response = await fetch(url);
      const result = await response.json();
      setData(result);
    };

    poll(); // Initial fetch
    const timer = setInterval(poll, interval);

    return () => clearInterval(timer);
  }, [url, interval]);

  return data;
}
```

---

### 7. OTP-Style Input Component (shadcn/ui)

**Decision**: Sử dụng `InputOTP` component có sẵn trong shadcn/ui.

**Rationale**:

- Component có sẵn, không cần tự implement
- Đã được test kỹ và có accessibility support
- Copy-paste functionality built-in
- Hỗ trợ cả numeric và alphanumeric

**Installation**:

```bash
npx shadcn@latest add input-otp
```

**Usage** (từ Context7 shadcn docs):

```tsx
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
  InputOTPSeparator,
} from "@/components/ui/input-otp";

function TicketInput() {
  const [value, setValue] = useState("");

  return (
    <div className="space-y-2">
      <label>Nhập bộ số (3 chữ số)</label>
      <InputOTP maxLength={3} value={value} onChange={setValue}>
        <InputOTPGroup>
          <InputOTPSlot index={0} />
          <InputOTPSlot index={1} />
          <InputOTPSlot index={2} />
        </InputOTPGroup>
      </InputOTP>
    </div>
  );
}

// Với 2 bộ số
function FullTicketInput() {
  const [first, setFirst] = useState("");
  const [second, setSecond] = useState("");

  return (
    <div className="flex items-center gap-2">
      <InputOTP maxLength={3} value={first} onChange={setFirst}>
        <InputOTPGroup>
          <InputOTPSlot index={0} />
          <InputOTPSlot index={1} />
          <InputOTPSlot index={2} />
        </InputOTPGroup>
      </InputOTP>
      <span className="text-2xl font-bold text-muted-foreground">-</span>
      <InputOTP maxLength={3} value={second} onChange={setSecond}>
        <InputOTPGroup>
          <InputOTPSlot index={0} />
          <InputOTPSlot index={1} />
          <InputOTPSlot index={2} />
        </InputOTPGroup>
      </InputOTP>
    </div>
  );
}
```

---

### 8. Ticket Management (Update/Delete với Authentication)

**Decision**: Thêm API endpoints cho cập nhật và xóa vé số, yêu cầu ADMIN_SECRET để xác thực.

**Rationale**:

- Cho phép sửa lỗi nhập sai vé số
- Bảo vệ bằng mật mã lưu trong Cloudflare secrets
- Đơn giản, không cần hệ thống authentication phức tạp

**API Endpoints**:

```
PUT  /api/v1/tickets/:id    - Cập nhật vé số (cần admin secret)
DELETE /api/v1/tickets/:id  - Xóa vé số (cần admin secret)
```

**Request Headers**:

```
X-Admin-Secret: your-admin-password
```

**Implementation**:

```typescript
// Middleware kiểm tra admin secret
function requireAdminSecret(req: Request, env: Env): boolean {
  const providedSecret = req.headers.get('X-Admin-Secret');
  const adminSecret = env.ADMIN_SECRET;

  if (!providedSecret || providedSecret !== adminSecret) {
    return false;
  }
  return true;
}

// Update ticket
app.put('/api/v1/tickets/:id', async (req, res) => {
  if (!requireAdminSecret(req, env)) {
    return res.status(401).json({ error: 'Invalid admin secret' });
  }

  const { id } = req.params;
  const { numbers } = req.body;

  // Validate new numbers
  if (!validateNumbers(numbers)) {
    return res.status(400).json({ error: 'Invalid numbers' });
  }

  // Check duplicate (excluding current ticket)
  if (await isDuplicateTicket(numbers, id, env.KV)) {
    return res.status(409).json({ error: 'Duplicate ticket' });
  }

  // Update ticket
  const ticket = await updateTicket(id, numbers, env.KV);
  res.json({ success: true, data: ticket });
});

// Delete ticket
app.delete('/api/v1/tickets/:id', async (req, res) => {
  if (!requireAdminSecret(req, env)) {
    return res.status(401).json({ error: 'Invalid admin secret' });
  }

  const { id } = req.params;
  await deleteTicket(id, env.KV);
  res.json({ success: true });
});
```

**wrangler.toml secrets**:

```bash
# Set admin secret
wrangler secret put ADMIN_SECRET
# Enter value: your-secure-password-here
```

**API Contract Update**:

```yaml
# Update Ticket
PUT /api/v1/tickets/:id
Headers:
  X-Admin-Secret: string (required)
Body:
  numbers: [string, string] (required, 2 elements, each 3 digits)

Response 200:
  success: true
  data: { id, participantId, numbers, createdAt }

Response 401:
  success: false
  error: { code: "UNAUTHORIZED", message: "Invalid admin secret" }

# Delete Ticket
DELETE /api/v1/tickets/:id
Headers:
  X-Admin-Secret: string (required)

Response 200:
  success: true

Response 401:
  success: false
  error: { code: "UNAUTHORIZED", message: "Invalid admin secret" }
```

---

## Summary

Tất cả các NEEDS CLARIFICATION đã được giải quyết. Key decisions:

1. **Deployment**: Node.js/Express trên Cloudflare Workers với compatibility layer
2. **Storage**: Cloudflare KV với native binding
3. **HTML Scraping**: cheerio để parse xskt.com.vn
4. **Scheduled Jobs**: Cloudflare Workers Cron Triggers
5. **Real-Time**: HTTP polling mỗi 5-10 giây
6. **Notifications**: Lark webhook với interactive cards
7. **UX**: shadcn/ui InputOTP component có sẵn
8. **Ticket Management**: API update/delete với ADMIN_SECRET authentication

Ready for Phase 1: Data Model & Contracts.
