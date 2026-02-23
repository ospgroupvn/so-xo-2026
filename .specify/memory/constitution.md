<!--
  BÁO CÁO ẢNH HƯỞNG ĐỒNG BỘ
  ================================
  Thay đổi phiên bản: chưa có → 1.0.0
  Nguyên tắc đã sửa đổi: chưa có
  Các phần đã thêm:
    - Test-First Development (NON-NEGOTIABLE)
    - Real-Time User Experience
    - Intuitive Data Entry
    - Transparent Data Handling
    - Cloud-Native Architecture
  Các phần đã loại bỏ: không có
  Templates cần cập nhật:
    ✅ .specify/templates/plan-template.md - Constitution Check đã có sẵn
    ✅ .specify/templates/spec-template.md - Phù hợp với các nguyên tắc mới
    ✅ .specify/templates/tasks-template.md - Đã hỗ trợ test-first approach
    ✅ .claude/commands/speckit.*.md - Không có tham chiếu lỗi thời
  TODO theo dõi: không có
-->

# So Khớp Xổ Số Constitution

## Core Principles

### I. Test-First Development (NON-NEGOTIABLE)

**Quy tắc**: Mọi tính năng PHẢI được kiểm thử trước khi triển khai. Tests được viết → Người dùng duyệt → Tests FAIL → Sau đó mới implement. Vòng lặp Red-Green-Refactor được thực thi nghiêm ngặt.

**Lý do**: Đảm bảo chất lượng code, phòng tránh bugs, đặc biệt quan trọng cho logic so khớp giải thưởng phức tạp. Tests với dữ liệu cũ và mô phỏng là bắt buộc.

### II. Real-Time User Experience

**Quy tắc**: Hệ thống PHẢI cập nhật kết quả thời gian thực khi đang quay số (6h30). Sử dụng request pooling để cập nhật giao diện. Kết quả hiển thị ngay khi có dữ liệu mới.

**Lý do**: Người dùng mong đợi xem kết quả ngay khi quay số. Delay tạo ra trải nghiệm kém và mất niềm tin.

### III. Intuitive Data Entry

**Quy tắc**: Giao diện nhập vé số PHẢI trực quan, hỗ trợ bàn phím toàn phần. Hiển thị các bộ số theo kiểu OTP - nổi bật, rõ ràng. Dễ di chuyển qua lại giữa các bộ số.

**Lý do**: Nhập nhiều bộ số 3-chữ số là hành động lặp lại. UX kém gây frustration và lỗi nhập liệu.

### IV. Transparent Data Handling

**Quy tắc**: Mọi dữ liệu là công khai (tên, vé số, kết quả). Dashboard hiển thị thông tin cho tất cả mọi người. Secret (webhook URL) PHẢI được lưu trong Cloudflare KV secrets, không hardcode.

**Lý do**: Dự án có tính chất giải trí cộng đồng. Không có dữ liệu private. Secret management là bắt buộc để bảo mật webhook.

### V. Cloud-Native Architecture

**Quy tắc**: Backend sử dụng Cloudflare Workers. Dữ liệu lưu trữ trong Cloudflare Workers KV. Không dùng database server truyền thống. Fetch kết quả từ xskt.com.vn, parse HTML, lưu vào KV.

**Lý do**: Serverless giảm chi phí, tự động scale, phù hợp với workload định kỳ (quay số 2 ngày/lần).

## Tech Stack Constraints

- **Frontend**: React, shadcn/ui, tailwindcss - KHÔNG THAY ĐỔI
- **Backend**: NodeJS, Cloudflare Workers - KHÔNG THAY ĐỔI
- **Database**: Cloudflare Workers KV - KHÔNG THAY ĐỔI
- **Notification**: Lark Webhook - KHÔNG THAY ĐỔI

## Development Workflow

1. **Spec First**: Mọi tính năng bắt đầu từ đặc tả rõ ràng
2. **Test First**: Tests được viết trước khi code, PHẢI FAIL trước khi implement
3. **Review Required**: Code review bắt buộc trước khi merge
4. **Document Changes**: Cập nhật docs khi có thay đổi logic quan trọng

## Deployment Logic

### Wrangler CLI (Cloudflare Workers)

**Xác thực đăng nhập** (kiểm tra trước mỗi deploy):
```bash
wrangler whoami
# Nếu chưa đăng nhập: wrangler login
```

**Cấu hình project** (file `wrangler.toml`):
```toml
name = "so-khop-xo-so"
main = "src/worker.ts"
compatibility_date = "2024-01-01"

[[kv_namespaces]]
binding = "KV"
id = "xxxxxxxxxxxxxxxxx"  # Lấy từ: wrangler kv:namespace create "SO_KHOP_XO_SO"

[vars]
ENVIRONMENT = "production"
```

**Triển khai Worker**:
```bash
# Deploy production
wrangler deploy

# Deploy với environment cụ thể
wrangler deploy --env production

# Xem log real-time
wrangler tail
```

**Quản lý KV**:
```bash
# Tạo namespace mới
wrangler kv:namespace create "SO_KHOP_XO_SO"

# Liệt kê namespaces
wrangler kv:namespace list

# Đọc key (debug)
wrangler kv:key get --namespace-id=<id> "<key>"

# Ghi key (debug)
wrangler kv:key put --namespace-id=<id> "<key>" "<value>"
```

**Secrets Management** (Lark Webhook URL):
```bash
# Lưu secret
wrangler secret put LARK_WEBHOOK_URL

# Xem danh sách secrets (không show giá trị)
wrangler secret list

# Xóa secret
wrangler secret delete LARK_WEBHOOK_URL
```

**Development Local**:
```bash
# Chạy local development server
wrangler dev

# Chạy với remote KV (kết nối KV production)
wrangler dev --remote
```

### Quản lý Environment

- **Development**: `wrangler dev` - Hot reload, local testing
- **Production**: `wrangler deploy` - Deploy tự động đến production
- **Logging**: `wrangler tail` - Xem log real-time từ production worker

## Governance

Hiến pháp này vượt trội hơn mọi practice khác. Mọi sửa đổi cần:
- Tài liệu hóa rõ lý do thay đổi
- Phê duyệt từ người dùng
- Kế hoạch migration nếu ảnh hưởng đến code hiện có

**Version**: 1.0.1 | **Ratified**: 2026-02-23 | **Last Amended**: 2026-02-23
