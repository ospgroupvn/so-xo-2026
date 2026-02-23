# Webhook Contract: Lark Notification

**Endpoint**: Lark Webhook URL (stored in environment variable `LARK_WEBHOOK_URL`)
**Method**: `POST`
**Content-Type**: `application/json`

## Overview

Hệ thống gửi thông báo đến Lark webhook khi phát hiện người trúng giải. Webhook URL được lưu trữ an toàn trong Cloudflare KV secrets.

## Message Types

### 1. Win Notification (Trúng Giải)

Gửi khi có người trúng giải.

#### Request Body

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
          "content": "**👤 Người trúng giải:**\nNguyễn Văn A"
        }
      },
      {
        "tag": "div",
        "text": {
          "tag": "lark_md",
          "content": "**🎫 Vé số:**\n123 456"
        }
      },
      {
        "tag": "div",
        "text": {
          "tag": "lark_md",
          "content": "**🏆 Giải thưởng:**\nGIẢI NHẤT"
        }
      },
      {
        "tag": "div",
        "text": {
          "tag": "lark_md",
          "content": "**📅 Ngày quay:**\n23/02/2026"
        }
      },
      {
        "tag": "note",
       elements": [
          {
            "tag": "plain_text",
            "content": "Hệ thống Theo Dõi Xổ Số Max 3D+"
          }
        ]
      }
    ]
  }
}
```

---

### 2. Fetch Started Notification

Gửi khi bắt đầu fetch kết quả (tùy chọn).

#### Request Body

```json
{
  "msg_type": "interactive",
  "card": {
    "header": {
      "title": {
        "tag": "plain_text",
        "content": "🔄 Bắt đầu lấy kết quả"
      },
      "template": "blue"
    },
    "elements": [
      {
        "tag": "div",
        "text": {
          "tag": "lark_md",
          "content": "**⏰ Thời gian:** 18:10 - 23/02-2026\n**📊 Trạng thái:** Đang lấy kết quả..."
        }
      }
    ]
  }
}
```

---

### 3. Fetch Complete Notification

Gửi khi fetch hoàn thành (tùy chọn).

#### Request Body

```json
{
  "msg_type": "interactive",
  "card": {
    "header": {
      "title": {
        "tag": "plain_text",
        "content": "✅ Hoàn thành lấy kết quả"
      },
      "template": "green"
    },
    "elements": [
      {
        "tag": "div",
        "text": {
          "tag": "lark_md",
          "content": "**⏰ Thời gian hoàn thành:** 18:25 - 23/02/2026\n**📊 Số lượng:** 20/20 bộ số\n**🏆 Số người trúng giải:** 5"
        }
      }
    ]
  }
}
```

---

### 4. Error Notification

Gửi khi có lỗi nghiêm trọng (tùy chọn).

#### Request Body

```json
{
  "msg_type": "interactive",
  "card": {
    "header": {
      "title": {
        "tag": "plain_text",
        "content": "⚠️ Lỗi hệ thống"
      },
      "template": "red"
    },
    "elements": [
      {
        "tag": "div",
        "text": {
          "tag": "lark_md",
          "content": "**❌ Lỗi:** Không thể lấy kết quả từ xskt.com.vn\n**⏰ Thời gian:** 18:15 - 23/02/2026\n**🔄 Số lần thử:** 3/3"
        }
      }
    ]
  }
}
```

---

## Response Handling

### Success Response

```json
{
  "StatusCode": 0,
  "StatusMessage": "success"
}
```

### Error Response

```json
{
  "StatusCode": 10001,
  "StatusMessage": "invalid webhook url"
}
```

---

## Retry Policy

| Scenario | Action |
|----------|--------|
| Network error | Retry 3 times with 1s delay |
| 5xx server error | Retry 3 times with exponential backoff |
| 4xx client error | No retry, log error |
| Rate limit (429) | Retry after Retry-After header |

---

## Webhook URL Management

### Environment Variable

```bash
# .env (local development)
LARK_WEBHOOK_URL=https://open.larksuite.com/open-apis/bot/v2/hook/xxx

# Cloudflare KV Secret (production)
wrangler secret put LARK_WEBHOOK_URL
```

### Validation

Webhook URL phải:
- Bắt đầu với `https://open.larksuite.com/open-apis/bot/v2/hook/`
- Là valid URL
- Được test trước khi sử dụng

---

## Testing

### Manual Test

```bash
curl -X POST "$LARK_WEBHOOK_URL" \
  -H "Content-Type: application/json" \
  -d '{
    "msg_type": "text",
    "content": {
      "text": "Test notification from lottery tracker"
    }
  }'
```

### Integration Test

Sử dụng endpoint `/api/v1/results/fetch` với force=true để trigger fetch và test webhook.
