---
description: Tạo hoặc cập nhật hiến pháp dự án từ các nguyên tắc tương tác hoặc đã cung cấp, đảm bảo tất cả các template phụ thuộc được đồng bộ.
handoffs:
  - label: Xây dựng Thông số Kỹ thuật
    agent: speckit.specify
    prompt: Triển khai thông số kỹ thuật tính năng dựa trên hiến pháp đã cập nhật. Tôi muốn xây dựng...
---

## Đầu vào Người dùng

```text
$ARGUMENTS
```

Bạn **BẮT BUỘC** phải xem xét đầu vào của người dùng trước khi tiếp tục (nếu không rỗng).

## Tóm tắt

Bạn đang cập nhật hiến pháp dự án tại `.specify/memory/constitution.md`. File này là một TEMPLATE chứa các token placeholder trong ngoặc vuông (ví dụ `[PROJECT_NAME]`, `[PRINCIPLE_1_NAME]`). Nhiệm vụ của bạn là (a) thu thập/xác định các giá trị cụ thể, (b) điền vào template một cách chính xác, và (c) lan truyền mọi sửa đổi sang các artifact phụ thuộc.

**Lưu ý**: Nếu `.specify/memory/constitution.md` chưa tồn tại, nó nên đã được khởi tạo từ `.specify/templates/constitution-template.md` trong quá trình thiết lập dự án. Nếu bị thiếu, hãy sao chép template trước.

Thực hiện theo quy trình sau:

1. Tải hiến pháp hiện có tại `.specify/memory/constitution.md`.
   - Xác định mọi token placeholder có dạng `[ALL_CAPS_IDENTIFIER]`.
   **QUAN TRỌNG**: Người dùng có thể yêu cầu ít hoặc nhiều nguyên tắc hơn so với những gì được sử dụng trong template. Nếu một số được chỉ định, hãy tôn trọng điều đó - tuân theo template chung. Bạn sẽ cập nhật tài liệu tương ứng.

2. Thu thập/xác định giá trị cho các placeholder:
   - Nếu đầu vào người dùng (hội thoại) cung cấp giá trị, hãy sử dụng nó.
   - Ngược lại, suy ra từ ngữ cảnh repo hiện có (README, docs, phiên bản hiến pháp trước nếu có).
   - Đối với ngày tháng quản trị: `RATIFICATION_DATE` là ngày ban hành gốc (nếu không biết hãy hỏi hoặc đánh dấu TODO), `LAST_AMENDED_DATE` là hôm nay nếu có thay đổi, nếu không giữ nguyên ngày trước.
   - `CONSTITUTION_VERSION` phải tăng theo quy tắc semantic versioning:
     - MAJOR: Loại bỏ hoặc định nghĩa lại quản trị/nguyên tắc không tương thích ngược.
     - MINOR: Thêm nguyên tắc/phần mới hoặc mở rộng đáng kể hướng dẫn.
     - PATCH: Các làm rõ, sửa lỗi chính tả, tinh chỉnh không thay đổi ngữ nghĩa.
   - Nếu loại tăng version không rõ ràng, đề xuất lý do trước khi hoàn thiện.

3. Soạn thảo nội dung hiến pháp đã cập nhật:
   - Thay thế mọi placeholder bằng văn bản cụ thể (không còn token trong ngoặc vuồng ngoại trừ các slot template được giữ lại có chủ đích mà dự án chưa chọn định nghĩa — giải thích rõ bất kỳ slot nào còn lại).
   - Giữ nguyên thứ tự heading và các chú thích có thể xóa sau khi thay thế trừ khi chúng vẫn thêm hướng dẫn làm rõ.
   - Đảm bảo mỗi phần Nguyên tắc: tên ngắn gọn, đoạn văn (hoặc danh sách) nắm bắt các quy tắc không thể thương lượng, lý do rõ ràng nếu không hiển nhiên.
   - Đảm bảo phần Quản trị liệt kê quy trình sửa đổi, chính sách phiên bản, và kỳ vọng xem xét tuân thủ.

4. Danh sách kiểm tra lan truyền tính nhất quán (chuyển đổi danh sách kiểm tra trước thành xác thực актив):
   - Đọc `.specify/templates/plan-template.md` và đảm bảo mọi "Constitution Check" hoặc quy tắc phù hợp với các nguyên tắc đã cập nhật.
   - Đọc `.specify/templates/spec-template.md` để đồng bộ phạm vi/yêu cầu — cập nhật nếu hiến pháp thêm/bỏ các phần bắt buộc hoặc ràng buộc.
   - Đọc `.specify/templates/tasks-template.md` và đảm bảo phân loại nhiệm vụ phản ánh các loại nhiệm vụ dựa trên nguyên tắc mới hoặc đã loại bỏ (ví dụ: khả năng quan sát, lập phiên bản, kỷ luật kiểm thử).
   - Đọc mỗi file lệnh trong `.specify/templates/commands/*.md` (bao gồm file này) để xác minh không có tham chiếu lỗi thời (tên cụ thể của tác nhân như CLAUDE) còn lại khi cần hướng dẫn chung.
   - Đọc bất kỳ tài liệu hướng dẫn runtime nào (ví dụ: `README.md`, `docs/quickstart.md`, hoặc file hướng dẫn cụ thể của tác nhân nếu có). Cập nhật các tham chiếu đến nguyên tắc đã thay đổi.

5. Tạo Báo cáo Ảnh hưởng Đồng bộ (đặt trước dưới dạng chú thích HTML ở đầu file hiến pháp sau khi cập nhật):
   - Thay đổi phiên bản: cũ → mới
   - Danh sách các nguyên tắc đã sửa đổi (tên cũ → tên mới nếu đổi tên)
   - Các phần đã thêm
   - Các phần đã loại bỏ
   - Templates cần cập nhật (✅ đã cập nhật / ⚠ đang chờ) với đường dẫn file
   - TODO theo dõi nếu có placeholder được trì hoãn có chủ đích.

6. Xác thực trước khi đầu ra cuối cùng:
   - Không còn token trong ngoặc vuông vô lý.
   - Dòng phiên bản khớp với báo cáo.
   - Ngày tháng định dạng ISO YYYY-MM-DD.
   - Các nguyên tắc mang tính khai báo, có thể kiểm thử, và không có ngôn ngữ mơ hồ ("should" → thay thế bằng MUST/SHOULD với lý do nếu phù hợp).

7. Ghi hiến pháp đã hoàn thiện trở lại `.specify/memory/constitution.md` (ghi đè).

8. Xuất tóm tắt cuối cùng cho người dùng với:
   - Phiên bản mới và lý do tăng phiên bản.
   - Bất kỳ file nào được đánh dấu cần theo dõi thủ công.
   - Thông điệp commit đề xuất (ví dụ: `docs: amend constitution to vX.Y.Z (principle additions + governance update)`).

Yêu cầu Định dạng & Phong cách:

- Sử dụng Markdown headings chính xác như trong template (không hạ/nâng cấp).
- Ngắt các dòng lý do dài để giữ tính dễ đọc (<100 ký tự lý tưởng) nhưng không ép buộc với các ngắt khó chịu.
- Giữ một dòng trống giữa các phần.
- Tránh whitespace ở cuối dòng.

Nếu người dùng cung cấp cập nhật một phần (ví dụ: chỉ sửa đổi một nguyên tắc), vẫn thực hiện các bước xác thực và quyết định phiên bản.

Nếu thiếu thông tin quan trọng (ví dụ: ngày phê chuẩn thực sự không rõ), hãy chèn `TODO(<FIELD_NAME>): explanation` và bao gồm trong Báo cáo Ảnh hưởng Đồng bộ dưới mục items đã trì hoãn.

Không tạo template mới; luôn hoạt động trên file `.specify/memory/constitution.md` hiện có.
