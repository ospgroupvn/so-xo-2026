---
description: Thực thi quy trình lập kế hoạch triển khai sử dụng mẫu plan để tạo ra các thiết kế artifact.
handoffs:
  - label: Tạo Tasks
    agent: speckit.tasks
    prompt: Chia nhỏ kế hoạch thành các tasks
    send: true
  - label: Tạo Checklist
    agent: speckit.checklist
    prompt: Tạo checklist cho domain sau...
---

## Đầu vào của người dùng

```text
$ARGUMENTS
```

Bạn **BẮT BUỘC** phải xem xét đầu vào của người dùng trước khi tiếp tục (nếu không rỗng).

## Tóm tắt quy trình

1. **Thiết lập**: Chạy `.specify/scripts/bash/setup-plan.sh --json` từ thư mục gốc repo và phân tích JSON để lấy FEATURE_SPEC, IMPL_PLAN, SPECS_DIR, BRANCH. Với các tham số chứa dấu ngoặc đơn như "I'm Groot", sử dụng cú pháp escape: ví dụ 'I'\''m Groot' (hoặc dùng ngoặc kép nếu có thể: "I'm Groot").

2. **Tải ngữ cảnh**: Đọc FEATURE_SPEC và `.specify/memory/constitution.md`. Tải mẫu IMPL_PLAN (đã được sao chép).

3. **Thực thi quy trình kế hoạch**: Theo cấu trúc trong mẫu IMPL_PLAN để:
   - Điền Technical Context (đánh dấu các mục chưa rõ là "NEEDS CLARIFICATION")
   - Điền phần Constitution Check từ constitution
   - Đánh giá các gate (BÁO LỖI nếu các vi phạm không được giải thích)
   - Phase 0: Tạo research.md (giải quyết tất cả NEEDS CLARIFICATION)
   - Phase 1: Tạo data-model.md, contracts/, quickstart.md
   - Phase 1: Cập nhật ngữ cảnh agent bằng cách chạy agent script
   - Đánh giá lại Constitution Check sau khi thiết kế

4. **Dừng và báo cáo**: Lệnh kết thúc sau khi lập kế hoạch Phase 2. Báo cáo branch, đường dẫn IMPL_PLAN, và các artifact đã tạo.

## Các giai đoạn

### Phase 0: Đề cương & Nghiên cứu

1. **Trích xuất các mục chưa rõ từ Technical Context** ở trên:
   - Với mỗi NEEDS CLARIFICATION → task nghiên cứu
   - Với mỗi dependency → task best practices
   - Với mỗi integration → task patterns

2. **Tạo và gửi các research agents**:

   ```text
   For each unknown in Technical Context:
     Task: "Research {unknown} for {feature context}"
   For each technology choice:
     Task: "Find best practices for {tech} in {domain}"
   ```

3. **Tổng hợp kết quả** trong `research.md` sử dụng định dạng:
   - Decision: [cái gì được chọn]
   - Rationale: [tại sao chọn]
   - Alternatives considered: [các lựa chọn khác đã đánh giá]

**Đầu ra**: research.md với tất cả NEEDS CLARIFICATION được giải quyết

### Phase 1: Thiết kế & Hợp đồng

**Điều kiện tiên quyết:** `research.md` hoàn thành

1. **Trích xuất entities từ feature spec** → `data-model.md`:
   - Tên entity, các trường, mối quan hệ
   - Quy tắc validation từ requirements
   - Chuyển đổi trạng thái nếu có áp dụng

2. **Định nghĩa interface contracts** (nếu project có các giao diện bên ngoài) → `/contracts/`:
   - Xác định các giao diện mà project exposes cho người dùng hoặc hệ thống khác
   - Tài liệu định dạng contract phù hợp với loại project
   - Ví dụ: public APIs cho thư viện, lược đồ lệnh cho CLI tools, endpoints cho web services, ngữ pháp cho parsers, hợp đồng UI cho applications
   - Bỏ qua nếu project hoàn toàn nội bộ (build scripts, one-off tools, v.v.)

3. **Cập nhật ngữ cảnh agent**:
   - Chạy `.specify/scripts/bash/update-agent-context.sh claude`
   - Các script này phát hiện AI agent nào đang được sử dụng
   - Cập nhật file ngữ cảnh tương ứng cho agent đó
   - Chỉ thêm công nghệ mới từ kế hoạch hiện tại
   - Giữ nguyên các bổ sung thủ công giữa các markers

**Đầu ra**: data-model.md, /contracts/*, quickstart.md, file dành cho agent

## Quy tắc chính

- Sử dụng đường dẫn tuyệt đối
- BÁO LỖI khi gate thất bại hoặc các mục cần làm rõ chưa được giải quyết
