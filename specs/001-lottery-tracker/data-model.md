# Data Model: Hệ Thống Theo Dõi Xổ Số Max 3D+

**Date**: 2026-02-23
**Feature**: 001-lottery-tracker

## Entity Relationship Diagram

```
┌─────────────────┐       ┌─────────────────┐
│   Participant   │       │     Ticket      │
├─────────────────┤       ├─────────────────┤
│ id: string      │───1:N─│ id: string      │
│ name: string    │       │ participantId   │
│ tickets: Ticket │       │ numbers: [2]    │
│ createdAt: Date │       │ createdAt: Date │
└─────────────────┘       └─────────────────┘

┌─────────────────┐       ┌───────────────────────┐
│   DrawResult    │       │   WinNotification     │
├─────────────────┤       ├───────────────────────┤
│ id: string      │       │ id: string            │
│ date: string    │       │ ticketId: string      │
│ first: [2]      │       │ prize: Prize          │
│ second: [[2]]   │       │ notifiedAt: Date      │
│ third: [[2]]    │       │ webhookSent: boolean  │
│ fourth: [[2]]   │       └───────────────────────┘
│ allNumbers: [20]│
│ fetchedAt: Date │
└─────────────────┘
```

## Entities

### 1. Participant (Người Dùng)

Đại diện cho một người được tặng vé số.

```typescript
interface Participant {
  // Primary key: UUID v4
  id: string;

  // Tên người dùng (đã được sanitization)
  // - Trim whitespace
  // - Max 50 characters
  // - Filter HTML/JS characters
  name: string;

  // Danh sách ID các vé số đã đăng ký
  ticketIds: string[];

  // Thời điểm tạo
  createdAt: string; // ISO 8601
}
```

**Validation Rules**:
- `name`: Required, 1-50 chars, không chứa `<>'"&`
- `id`: Auto-generated UUID v4

**KV Storage Key**: `participant:{id}`

---

### 2. Ticket (Vé Số)

Một vé Max 3D+ gồm 2 bộ số, mỗi bộ có 3 chữ số.

```typescript
interface Ticket {
  // Primary key: UUID v4
  id: string;

  // Foreign key to Participant
  participantId: string;

  // 2 bộ số, mỗi bộ là string 3 chữ số
  // Ví dụ: ["123", "456"]
  numbers: [string, string];

  // Thời điểm tạo
  createdAt: string; // ISO 8601
}
```

**Validation Rules**:
- `numbers`: Array of exactly 2 elements
- Each number: Exactly 3 digits, each digit 0-9
- Unique constraint: Không được trùng hoàn toàn với ticket khác (cả 2 bộ)

**KV Storage Keys**:
- `ticket:{id}` - Ticket data
- `ticket:by_numbers:{num1}:{num2}` - Index for duplicate check (value: ticketId)

---

### 3. DrawResult (Kết Quả Quay Số)

Kết quả của một buổi quay số Max 3D+.

```typescript
interface DrawResult {
  // Primary key: Date string (YYYY-MM-DD)
  id: string; // "2026-02-23"

  // Ngày quay số
  date: string; // "2026-02-23"

  // Giải nhất: 2 bộ số (1 cặp)
  first: [string, string];

  // Giải nhì: 2 cặp, mỗi cặp 2 bộ số
  second: [[string, string], [string, string]];

  // Giải ba: 3 cặp, mỗi cặp 2 bộ số
  third: [[string, string], [string, string], [string, string]];

  // Giải tư: 4 cặp, mỗi cặp 2 bộ số
  fourth: [[string, string], [string, string], [string, string], [string, string]];

  // Tất cả 20 bộ số (flat array) để kiểm tra giải năm
  allNumbers: string[]; // 20 elements

  // Số lượng bộ số đã lấy (progress indicator)
  fetchedCount: number;

  // Trạng thái fetch
  status: 'partial' | 'complete';

  // Thời điểm fetch hoàn thành
  fetchedAt: string | null; // ISO 8601
}
```

**Validation Rules**:
- `date`: Valid date string
- Each number: Exactly 3 digits, each digit 0-9
- `allNumbers`: Derived from first/second/third/fourth

**KV Storage Key**: `draw_result:{date}`

---

### 4. WinNotification (Thông Báo Trúng Giải)

Thông tin về người trúng giải.

```typescript
enum Prize {
  FIRST = 'GIẢI NHẤT',
  SECOND = 'GIẢI NHÌ',
  THIRD = 'GIẢI BA',
  FOURTH = 'GIẢI TƯ',
  FIFTH = 'GIẢI NĂM',
  SIXTH = 'GIẢI SÁU',
  SEVENTH = 'GIẢI BẢY'
}

interface WinNotification {
  // Primary key: UUID v4
  id: string;

  // Foreign key to Ticket
  ticketId: string;

  // Foreign key to Participant
  participantId: string;

  // Tên người trúng (denormalized for display)
  participantName: string;

  // Vé số trúng (denormalized for display)
  ticketNumbers: [string, string];

  // Giải thưởng
  prize: Prize;

  // Ngày quay số
  drawDate: string;

  // Đã gửi webhook chưa
  webhookSent: boolean;

  // Thời điểm tạo thông báo
  createdAt: string; // ISO 8601
}
```

**KV Storage Keys**:
- `win_notification:{id}` - Notification data
- `win_notification:by_ticket:{ticketId}:{drawDate}` - Index để tránh duplicate notifications

---

## State Transitions

### DrawResult Status

```
┌──────────┐     fetch started      ┌──────────┐
│  (none)  │ ──────────────────────>│ partial  │
└──────────┘                        └──────────┘
                                         │
                                    fetched >= 20
                                         │
                                         ▼
                                   ┌──────────┐
                                   │ complete │
                                   └──────────┘
```

### Ticket Lifecycle

```
┌──────────┐     validated      ┌──────────┐
│  draft   │ ─────────────────>│  saved   │
└──────────┘                    └──────────┘
                                     │
                          matched with DrawResult
                                     │
                                     ▼
                               ┌──────────┐
                               │  winner  │
                               └──────────┘
```

---

## Index Strategy (Cloudflare KV)

| Key Pattern | Purpose | TTL |
|-------------|---------|-----|
| `participant:{id}` | Participant data | 24h |
| `ticket:{id}` | Ticket data | 24h |
| `ticket:by_numbers:{num1}:{num2}` | Duplicate check index | 24h |
| `draw_result:{date}` | Draw result data | 24h |
| `win_notification:{id}` | Notification data | 24h |
| `win_notification:by_ticket:{ticketId}:{drawDate}` | Duplicate notification check | 24h |
| `list:participants` | List of all participant IDs | 24h |
| `list:tickets` | List of all ticket IDs | 24h |

---

## Data Volume Estimates

| Entity | Expected Volume | Storage per Record | Total Storage |
|--------|-----------------|-------------------|---------------|
| Participant | <100 | ~200 bytes | <20 KB |
| Ticket | <500 | ~150 bytes | <75 KB |
| DrawResult | 1/day | ~1 KB | <1 KB |
| WinNotification | <50/day | ~300 bytes | <15 KB |

**Total daily storage**: <100 KB (well within Cloudflare KV free tier)

---

## TypeScript Type Definitions

```typescript
// types/entities.ts

export interface Participant {
  id: string;
  name: string;
  ticketIds: string[];
  createdAt: string;
}

export interface Ticket {
  id: string;
  participantId: string;
  numbers: [string, string];
  createdAt: string;
}

export type PrizePair = [string, string];

export interface DrawResult {
  id: string;
  date: string;
  first: PrizePair;
  second: [PrizePair, PrizePair];
  third: [PrizePair, PrizePair, PrizePair];
  fourth: [PrizePair, PrizePair, PrizePair, PrizePair];
  allNumbers: string[];
  fetchedCount: number;
  status: 'partial' | 'complete';
  fetchedAt: string | null;
}

export enum Prize {
  FIRST = 'GIẢI NHẤT',
  SECOND = 'GIẢI NHÌ',
  THIRD = 'GIẢI BA',
  FOURTH = 'GIẢI TƯ',
  FIFTH = 'GIẢI NĂM',
  SIXTH = 'GIẢI SÁU',
  SEVENTH = 'GIẢI BẢY'
}

export interface WinNotification {
  id: string;
  ticketId: string;
  participantId: string;
  participantName: string;
  ticketNumbers: [string, string];
  prize: Prize;
  drawDate: string;
  webhookSent: boolean;
  createdAt: string;
}
```
