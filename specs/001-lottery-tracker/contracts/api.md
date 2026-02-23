# API Contract: Hệ Thống Theo Dõi Xổ Số Max 3D+

**Base URL**: `/api/v1`
**Content-Type**: `application/json`

## Endpoints

### 1. Health Check

**GET** `/health`

Kiểm tra trạng thái hệ thống.

#### Response

```json
{
  "status": "ok" | "degraded",
  "timestamp": "2026-02-23T18:10:00.000Z",
  "services": {
    "kv": "connected" | "disconnected",
    "scheduler": "running" | "stopped"
  }
}
```

#### Status Codes

| Code | Description |
|------|-------------|
| 200 | System healthy |
| 503 | System degraded |

---

### 2. Register Ticket

**POST** `/tickets`

Đăng ký vé số mới.

#### Request Body

```json
{
  "name": "Nguyễn Văn A",
  "numbers": ["123", "456"]
}
```

#### Request Validation

| Field | Type | Rules |
|-------|------|-------|
| name | string | Required, 1-50 chars, no HTML/JS chars |
| numbers | array | Exactly 2 elements, each 3 digits (000-999) |

#### Response (Success)

```json
{
  "success": true,
  "data": {
    "id": "uuid-v4",
    "participantId": "uuid-v4",
    "name": "Nguyễn Văn A",
    "numbers": ["123", "456"],
    "createdAt": "2026-02-23T10:30:00.000Z"
  }
}
```

#### Response (Error - Duplicate)

```json
{
  "success": false,
  "error": {
    "code": "DUPLICATE_TICKET",
    "message": "Vé số này đã được đăng ký bởi người khác",
    "details": {
      "existingOwner": "Nguyễn Văn B"
    }
  }
}
```

#### Response (Error - Validation)

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Dữ liệu không hợp lệ",
    "details": [
      { "field": "numbers[0]", "message": "Phải là 3 chữ số (000-999)" }
    ]
  }
}
```

#### Status Codes

| Code | Description |
|------|-------------|
| 201 | Ticket created successfully |
| 400 | Validation error |
| 409 | Duplicate ticket |
| 429 | Rate limit exceeded |

---

### 3. Update Ticket

**PUT** `/tickets/:id`

Cập nhật vé số đã đăng ký. Yêu cầu ADMIN_SECRET.

#### Path Parameters

| Param | Type | Description |
|-------|------|-------------|
| id | string | Ticket ID (UUID v4) |

#### Request Headers

| Header | Type | Description |
|--------|------|-------------|
| X-Admin-Secret | string | **Required**. Admin password stored in Cloudflare secrets |

#### Request Body

```json
{
  "numbers": ["789", "012"]
}
```

#### Request Validation

| Field | Type | Rules |
|-------|------|-------|
| numbers | array | Exactly 2 elements, each 3 digits (000-999) |

#### Response (Success)

```json
{
  "success": true,
  "data": {
    "id": "uuid-v4",
    "participantId": "uuid-v4",
    "name": "Nguyễn Văn A",
    "numbers": ["789", "012"],
    "createdAt": "2026-02-23T10:30:00.000Z",
    "updatedAt": "2026-02-23T11:00:00.000Z"
  }
}
```

#### Response (Error - Unauthorized)

```json
{
  "success": false,
  "error": {
    "code": "UNAUTHORIZED",
    "message": "Invalid admin secret"
  }
}
```

#### Status Codes

| Code | Description |
|------|-------------|
| 200 | Ticket updated successfully |
| 400 | Validation error |
| 401 | Invalid admin secret |
| 404 | Ticket not found |
| 409 | Duplicate ticket |

---

### 4. Delete Ticket

**DELETE** `/tickets/:id`

Xóa vé số đã đăng ký. Yêu cầu ADMIN_SECRET.

#### Path Parameters

| Param | Type | Description |
|-------|------|-------------|
| id | string | Ticket ID (UUID v4) |

#### Request Headers

| Header | Type | Description |
|--------|------|-------------|
| X-Admin-Secret | string | **Required**. Admin password stored in Cloudflare secrets |

#### Response (Success)

```json
{
  "success": true,
  "message": "Ticket deleted successfully"
}
```

#### Response (Error - Unauthorized)

```json
{
  "success": false,
  "error": {
    "code": "UNAUTHORIZED",
    "message": "Invalid admin secret"
  }
}
```

#### Status Codes

| Code | Description |
|------|-------------|
| 200 | Ticket deleted successfully |
| 401 | Invalid admin secret |
| 404 | Ticket not found |

---

### 5. List Tickets

**GET** `/tickets`

Lấy danh sách tất cả vé số đã đăng ký.

#### Query Parameters

| Param | Type | Default | Description |
|-------|------|---------|-------------|
| page | number | 1 | Page number |
| limit | number | 50 | Items per page (max 100) |

#### Response

```json
{
  "success": true,
  "data": {
    "tickets": [
      {
        "id": "uuid-v4",
        "participantName": "Nguyễn Văn A",
        "numbers": ["123", "456"],
        "createdAt": "2026-02-23T10:30:00.000Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 50,
      "total": 75,
      "totalPages": 2
    }
  }
}
```

#### Status Codes

| Code | Description |
|------|-------------|
| 200 | Success |

---

### 4. Get Draw Result

**GET** `/results/:date`

Lấy kết quả quay số theo ngày.

#### Path Parameters

| Param | Type | Description |
|-------|------|-------------|
| date | string | Date in YYYY-MM-DD format |

#### Response

```json
{
  "success": true,
  "data": {
    "id": "2026-02-23",
    "date": "2026-02-23",
    "first": ["123", "456"],
    "second": [
      ["111", "222"],
      ["333", "444"]
    ],
    "third": [
      ["555", "666"],
      ["777", "888"],
      ["999", "000"]
    ],
    "fourth": [
      ["101", "202"],
      ["303", "404"],
      ["505", "606"],
      ["707", "808"]
    ],
    "allNumbers": ["123", "456", "111", "222", "..."],
    "fetchedCount": 20,
    "status": "complete",
    "fetchedAt": "2026-02-23T18:25:00.000Z"
  }
}
```

#### Response (Not Found)

```json
{
  "success": false,
  "error": {
    "code": "RESULT_NOT_FOUND",
    "message": "Chưa có kết quả cho ngày này"
  }
}
```

#### Status Codes

| Code | Description |
|------|-------------|
| 200 | Success |
| 404 | No result for this date |

---

### 5. Get Current Result

**GET** `/results/today`

Lấy kết quả quay số của ngày hôm nay (shortcut).

#### Response

Same as GET `/results/:date`

#### Status Codes

| Code | Description |
|------|-------------|
| 200 | Success |
| 404 | No result today yet |

---

### 6. Manual Fetch Trigger

**POST** `/results/fetch`

Trigger thủ công việc lấy kết quả (admin/testing).

#### Request Body

```json
{
  "force": false
}
```

#### Request Validation

| Field | Type | Rules |
|-------|------|-------|
| force | boolean | Optional, default false. If true, re-fetch even if complete |

#### Response

```json
{
  "success": true,
  "data": {
    "message": "Fetch triggered",
    "status": "in_progress",
    "fetchedCount": 0
  }
}
```

#### Status Codes

| Code | Description |
|------|-------------|
| 202 | Fetch triggered |
| 409 | Already fetching |

---

### 7. Get Winners

**GET** `/winners`

Lấy danh sách người trúng giải.

#### Query Parameters

| Param | Type | Default | Description |
|-------|------|---------|-------------|
| date | string | today | Date in YYYY-MM-DD format |
| prize | string | all | Filter by prize (first, second, third, fourth, fifth, sixth, seventh) |

#### Response

```json
{
  "success": true,
  "data": {
    "date": "2026-02-23",
    "winners": [
      {
        "id": "uuid-v4",
        "participantName": "Nguyễn Văn A",
        "ticketNumbers": ["123", "456"],
        "prize": "GIẢI NHẤT",
        "webhookSent": true,
        "createdAt": "2026-02-23T18:11:00.000Z"
      }
    ],
    "summary": {
      "first": 1,
      "second": 0,
      "third": 2,
      "fourth": 0,
      "fifth": 5,
      "sixth": 3,
      "seventh": 10,
      "total": 21
    }
  }
}
```

#### Status Codes

| Code | Description |
|------|-------------|
| 200 | Success |

---

## Error Response Format

All error responses follow this format:

```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Human readable message",
    "details": {}
  }
}
```

### Error Codes

| Code | HTTP Status | Description |
|------|-------------|-------------|
| VALIDATION_ERROR | 400 | Invalid request data |
| UNAUTHORIZED | 401 | Invalid or missing admin secret |
| TICKET_NOT_FOUND | 404 | Ticket not found |
| DUPLICATE_TICKET | 409 | Ticket already exists |
| RESULT_NOT_FOUND | 404 | No draw result for date |
| ALREADY_FETCHING | 409 | Fetch already in progress |
| RATE_LIMIT_EXCEEDED | 429 | Too many requests |
| INTERNAL_ERROR | 500 | Server error |

---

## Rate Limiting

- **Tickets endpoint**: 10 requests per minute per IP
- **Other endpoints**: 60 requests per minute per IP

Rate limit headers included in response:

```
X-RateLimit-Limit: 10
X-RateLimit-Remaining: 5
X-RateLimit-Reset: 1708700100
```

---

## CORS

Allowed origins:
- `http://localhost:5173` (development)
- Production domain (TBD)

Allowed methods: `GET, POST, PUT, DELETE, OPTIONS`
Allowed headers: `Content-Type, X-Admin-Secret`
