---
description: Tạo file tasks.md có thể thực hiện được, được sắp xếp theo thứ tự phụ thuộc cho tính năng dựa trên các tài liệu thiết kế có sẵn.
handoffs:
  - label: Phân Tính Tính Nhất Quán
    agent: speckit.analyze
    prompt: Chạy phân tích dự án để kiểm tra tính nhất quán
    send: true
  - label: Triển Khai Dự Án
    agent: speckit.implement
    prompt: Bắt đầu triển khai theo từng giai đoạn
    send: true
---

## Đầu Vào Của Người Dùng

```text
$ARGUMENTS
```

Bạn **BẮT BUỘC** phải xem xét đầu vào của người dùng trước khi tiếp tục (nếu không rỗng).

## Tóm Tắt Quy Trình

1. **Thiết lập**: Chạy `.specify/scripts/bash/check-prerequisites.sh --json` từ thư mục gốc repo và phân tích FEATURE_DIR và danh sách AVAILABLE_DOCS. Tất cả đường dẫn phải là đường dẫn tuyệt đối. Với dấu nháy đơn trong tham số như "I'm Groot", sử dụng cú pháp escape: ví dụ 'I'\''m Groot' (hoặc dùng nháy kép nếu có thể: "I'm Groot").

2. **Tải tài liệu thiết kế**: Đọc từ FEATURE_DIR:
   - **Bắt buộc**: plan.md (tech stack, thư viện, cấu trúc), spec.md (user stories với mức độ ưu tiên)
   - **Tùy chọn**: data-model.md (thực thể), contracts/ (hợp đồng giao diện), research.md (quyết định), quickstart.md (kịch bản kiểm thử)
   - Lưu ý: Không phải tất cả dự án đều có đầy đủ tài liệu. Tạo tasks dựa trên những gì có sẵn.

3. **Thực thi quy trình tạo task**:
   - Tải plan.md và trích xuất tech stack, thư viện, cấu trúc dự án
   - Tải spec.md và trích xuất user stories với mức độ ưu tiên của chúng (P1, P2, P3, v.v.)
   - Nếu data-model.md tồn tại: Trích xuất các thực thể và ánh xạ đến user stories
   - Nếu contracts/ tồn tại: Ánh xạ các hợp đồng giao diện đến user stories
   - Nếu research.md tồn tại: Trích xuất các quyết định cho tasks thiết lập
   - Tạo task được tổ chức theo user story (xem Quy Tắc Tạo Task bên dưới)
   - Tạo đồ thị phụ thuộc hiển thị thứ tự hoàn thành user story
   - Tạo ví dụ thực thi song song cho mỗi user story
   - Kiểm tra tính đầy đủ của task (mỗi user story có tất cả task cần thiết, có thể kiểm thử độc lập)

4. **Tạo tasks.md**: Sử dụng `.specify/templates/tasks-template.md` làm cấu trúc, điền vào:
   - Tên tính năng chính xác từ plan.md
   - Giai đoạn 1: Tasks thiết lập (khởi tạo dự án)
   - Giai đoạn 2: Tasks nền tảng (điều kiện tiên quyết chặn tất cả user stories)
   - Giai đoạn 3+: Một giai đoạn cho mỗi user story (theo thứ tự ưu tiên từ spec.md)
   - Mỗi giai đoạn bao gồm: mục tiêu story, tiêu chí kiểm thử độc lập, kiểm thử (nếu được yêu cầu), tasks triển khai
   - Giai đoạn cuối: Hoàn thiện & các mối quan tâm xuyên suốt
   - Tất cả tasks phải tuân theo định dạng checklist nghiêm ngặt (xem Quy Tắc Tạo Task bên dưới)
   - Đường dẫn file rõ ràng cho mỗi task
   - Phần Dependencies hiển thị thứ tự hoàn thành story
   - Ví dụ thực thi song song cho mỗi story
   - Phần chiến lược triển khai (MVP trước, giao tiếp tăng dần)

5. **Báo cáo**: Xuất đường dẫn đến tasks.md đã tạo và tóm tắt:
   - Tổng số task
   - Số task cho mỗi user story
   - Cơ hội thực thi song song được xác định
   - Tiêu chí kiểm thử độc lập cho mỗi story
   - Phạm vi MVP đề xuất (thường chỉ là User Story 1)
   - Kiểm tra định dạng: Xác nhận TẤT CẢ tasks tuân theo định dạng checklist (checkbox, ID, nhãn, đường dẫn file)

Ngữ cảnh cho việc tạo task: $ARGUMENTS

File tasks.md nên có thể thực thi ngay lập tức - mỗi task phải đủ cụ thể để LLM có thể hoàn thành mà không cần ngữ cảnh bổ sung.

## Quy Tắc Tạo Task

**QUAN TRỌNG**: Tasks PHẢI được tổ chức theo user story để cho phép triển khai và kiểm thử độc lập.

**Kiểm thử là TÙY CHỌN**: Chỉ tạo task kiểm thử nếu được yêu cầu rõ ràng trong đặc tả tính năng hoặc nếu người dùng yêu cầu tiếp cận TDD.

### Định Dạng Checklist (BẮT BUỘC)

Mọi task PHẢI tuân thủ nghiêm ngặt định dạng này:

```text
- [ ] [TaskID] [P?] [Story?] Mô tả với đường dẫn file
```

**Các thành phần định dạng**:

1. **Checkbox**: LUÔN LUÔN bắt đầu bằng `- [ ]` (markdown checkbox)
2. **Task ID**: Số thứ tự (T001, T002, T003...) theo thứ tự thực thi
3. **Đánh dấu [P]**: Chỉ bao gồm nếu task có thể thực thi song song (khác file, không phụ thuộc vào tasks chưa hoàn thành)
4. **Nhãn [Story]**: BẮT BUỘC chỉ cho tasks của giai đoạn user story
   - Định dạng: [US1], [US2], [US3], v.v. (ánh xạ đến user stories từ spec.md)
   - Giai đoạn Setup: KHÔNG có nhãn story
   - Giai đoạn Foundational: KHÔNG có nhãn story
   - Giai đoạn User Story: PHẢI có nhãn story
   - Giai đoạn Polish: KHÔNG có nhãn story
5. **Mô tả**: Hành động rõ ràng với đường dẫn file chính xác

**Ví dụ**:

- ✅ ĐÚNG: `- [ ] T001 Tạo cấu trúc dự án theo kế hoạch triển khai`
- ✅ ĐÚNG: `- [ ] T005 [P] Triển khai authentication middleware trong src/middleware/auth.py`
- ✅ ĐÚNG: `- [ ] T012 [P] [US1] Tạo User model trong src/models/user.py`
- ✅ ĐÚNG: `- [ ] T014 [US1] Triển khai UserService trong src/services/user_service.py`
- ❌ SAI: `- [ ] Tạo User model` (thiếu ID và nhãn Story)
- ❌ SAI: `T001 [US1] Tạo model` (thiếu checkbox)
- ❌ SAI: `- [ ] [US1] Tạo User model` (thiếu Task ID)
- ❌ SAI: `- [ ] T001 [US1] Tạo model` (thiếu đường dẫn file)

### Tổ Chức Task

1. **Từ User Stories (spec.md)** - TỔ CHỨC CHÍNH:
   - Mỗi user story (P1, P2, P3...) có giai đoạn riêng
   - Ánh xạ tất cả thành phần liên quan đến story của chúng:
     - Models cần thiết cho story đó
     - Services cần thiết cho story đó
     - Giao diện/UI cần thiết cho story đó
     - Nếu kiểm thử được yêu cầu: Kiểm thử riêng cho story đó
   - Đánh dấu phụ thuộc story (hầu hết stories nên độc lập)

2. **Từ Contracts**:
   - Ánh xạ mỗi hợp đồng giao diện → đến user story mà nó phục vụ
   - Nếu kiểm thử được yêu cầu: Mỗi hợp đồng giao diện → task kiểm thử hợp đồng [P] trước khi triển khai trong giai đoạn story đó

3. **Từ Data Model**:
   - Ánh xạ mỗi thực thể đến (các) user story cần nó
   - Nếu thực thể phục vụ nhiều stories: Đặt trong story sớm nhất hoặc giai đoạn Setup
   - Mối quan hệ → tasks lớp service trong giai đoạn story phù hợp

4. **Từ Setup/Infrastructure**:
   - Hạ tầng dùng chung → Giai đoạn Setup (Giai đoạn 1)
   - Tasks nền tảng/chặn → Giai đoạn Foundational (Giai đoạn 2)
   - Thiết lập riêng cho story → trong giai đoạn story đó

### Cấu Trúc Giai Đoạn

- **Giai đoạn 1**: Setup (khởi tạo dự án)
- **Giai đoạn 2**: Foundational (điều kiện tiên quyết chặn - PHẢI hoàn thành trước user stories)
- **Giai đoạn 3+**: User Stories theo thứ tự ưu tiên (P1, P2, P3...)
  - Trong mỗi story: Kiểm thử (nếu được yêu cầu) → Models → Services → Endpoints → Tích hợp
  - Mỗi giai đoạn nên là một bước gia tăng hoàn chỉnh, có thể kiểm thử độc lập
- **Giai đoạn cuối**: Hoàn thiện & Các mối quan tâm xuyên suốt
