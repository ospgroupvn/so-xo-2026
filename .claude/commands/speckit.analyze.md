---
description: Thực hiện phân tích tính nhất quán và chất lượng phi phá hủy trên các artifact: spec.md, plan.md và tasks.md sau khi tạo tasks.
---

## Đầu vào của người dùng

```text
$ARGUMENTS
```

Bạn **BẮT BUỘC** phải xem xét đầu vào của người dùng trước khi tiếp tục (nếu không rỗng).

## Mục tiêu

Nhận diện các điểm không nhất quán, trùng lặp, mơ hồ và thiếu cụ thể trong ba artifact chính (`spec.md`, `plan.md`, `tasks.md`) trước khi triển khai. Lệnh này CHỈ được chạy sau khi `/speckit.tasks` đã tạo thành công một file `tasks.md` hoàn chỉnh.

## Ràng buộc thực thi

**CHỈ ĐỌC - KHÔNG GHI**: **Không** được sửa đổi bất kỳ file nào. Xuất báo cáo phân tích có cấu trúc. Đề xuất kế hoạch khắc phục tùy chọn (người dùng phải phê duyệt rõ ràng trước khi bất kỳ lệnh chỉnh sửa tiếp theo nào được gọi thủ công).

**Thẩm quyền hiến pháp**: Hiến pháp dự án (`.specify/memory/constitution.md`) **không thể thương lượng** trong phạm vi phân tích này. Xung đột với hiến pháp tự động được coi là NGHIÊM TRỌNG và yêu cầu điều chỉnh spec, plan hoặc tasks — không được pha loãng, diễn giải lại hoặc lặng lẽ bỏ qua nguyên tắc. Nếu chính một nguyên tắc cần thay đổi, điều đó phải diễn ra trong bản cập nhật hiến pháp riêng biệt, rõ ràng bên ngoài `/speckit.analyze`.

## Các bước thực thi

### 1. Khởi tạo ngữ cảnh phân tích

Chạy `.specify/scripts/bash/check-prerequisites.sh --json --require-tasks --include-tasks` một lần từ thư mục gốc của repo và phân tích JSON để lấy FEATURE_DIR và AVAILABLE_DOCS. Suy ra đường dẫn tuyệt đối:

- SPEC = FEATURE_DIR/spec.md
- PLAN = FEATURE_DIR/plan.md
- TASKS = FEATURE_DIR/tasks.md

Hủy bỏ với thông báo lỗi nếu bất kỳ file bắt buộc nào bị thiếu (hướng dẫn người dùng chạy lệnh điều kiện tiên quyết bị thiếu).
Đối với dấu nháy đơn trong tham số như "I'm Groot", sử dụng cú pháp escape: ví dụ 'I'\''m Groot' (hoặc dùng dấu nháy kép nếu có thể: "I'm Groot").

### 2. Tải artifacts (Tiết lộ tiến dần)

Chỉ tải ngữ cảnh tối thiểu cần thiết từ mỗi artifact:

**Từ spec.md:**

- Tổng quan/ngữ cảnh
- Yêu cầu chức năng
- Yêu cầu phi chức năng
- User stories
- Các trường hợp ngoại lệ (nếu có)

**Từ plan.md:**

- Lựa chọn kiến trúc/stack
- Tham chiếu mô hình dữ liệu
- Các giai đoạn
- Ràng buộc kỹ thuật

**Từ tasks.md:**

- ID của task
- Mô tả
- Phân nhóm theo giai đoạn
- Marker song song [P]
- Đường dẫn file được tham chiếu

**Từ hiến pháp:**

- Tải `.specify/memory/constitution.md` để xác thực nguyên tắc

### 3. Xây dựng mô hình ngữ nghĩa

Tạo các biểu diễn nội bộ (không bao gồm artifact gốc trong đầu ra):

- **Danh mục yêu cầu**: Mỗi yêu cầu chức năng + phi chức năng với một key ổn định (suy ra slug dựa trên mệnh lệnh; ví dụ, "User can upload file" → `user-can-upload-file`)
- **Danh mục user story/hành động**: Các hành động người dùng rời rạc với tiêu chí chấp nhận
- **Ánh xạ phủ sóng task**: Ánh xạ mỗi task tới một hoặc nhiều yêu cầu hoặc story (suy ra bằng từ khóa / mẫu tham chiếu rõ ràng như ID hoặc cụm từ khóa)
- **Bộ quy tắc hiến pháp**: Trích xuất tên nguyên tắc và câu mệnh đề MUST/SHOULD

### 4. Các lượt phát hiện (Phân tích hiệu quả về token)

Tập trung vào phát hiện có tín hiệu cao. Giới hạn 50 phát hiện tổng cộng; gom phần còn lại vào tóm tắt bổ sung.

#### A. Phát hiện trùng lặp

- Nhận diện yêu cầu gần như trùng lặp
- Đánh dấu cách diễn đạt chất lượng thấp để hợp nhất

#### B. Phát hiện tính mơ hồ

- Gắn cờ các tính từ mơ hồ (nhanh, có thể mở rộng, bảo mật, trực quan, mạnh mẽ) thiếu tiêu chí đo lường
- Gắn cờ các placeholder chưa giải quyết (TODO, TKTK, ???, `<placeholder>`, v.v.)

#### C. Thiếu cụ thể hóa

- Yêu cầu có động từ nhưng thiếu đối tượng hoặc kết quả đo lường được
- User stories thiếu sự liên kết tiêu chí chấp nhận
- Tasks tham chiếu file hoặc component không được định nghĩa trong spec/plan

#### D. Liên kết với hiến pháp

- Bất kỳ yêu cầu hoặc yếu tố plan nào xung đột với nguyên tắc MUST
- Thiếu phần bắt buộc hoặc cổng chất lượng từ hiến pháp

#### E. Khoảng trống phủ sóng

- Yêu cầu không có task liên quan
- Tasks không ánh xạ tới yêu cầu/story nào
- Yêu cầu phi chức năng không được phản ánh trong tasks (ví dụ: hiệu suất, bảo mật)

#### F. Tính không nhất quán

- Trôi thuật ngữ (cùng khái niệm được đặt tên khác nhau trên các file)
- Thực thể dữ liệu được tham chiếu trong plan nhưng không có trong spec (hoặc ngược lại)
- Mâu thuẫn thứ tự task (ví dụ: task tích hợp trước khi task thiết lập nền tảng không có ghi chú dependency)
- Yêu cầu xung đột (ví dụ: một yêu cầu Next.js trong khi yêu cầu khác chỉ định Vue)

### 5. Gán mức độ nghiêm trọng

Sử dụng heuristic này để ưu tiên phát hiện:

- **NGHIÊM TRỌNG**: Vi phạm MUST của hiến pháp, thiếu artifact spec cốt lõi, hoặc yêu cầu có phủ sóng bằng không gây chặn chức năng cơ bản
- **CAO**: Yêu cầu trùng lặp hoặc xung đột, thuộc tính bảo mật/hiệu suất mơ hồ, tiêu chí chấp nhận không thể kiểm thử
- **TRUNG BÌNH**: Trôi thuật ngữ, thiếu phủ sóng task phi chức năng, trường hợp ngoại lệ thiếu cụ thể
- **THẤP**: Cải tiến kiểu/lời văn, dư thừa nhỏ không ảnh hưởng thứ tự thực thi

### 6. Tạo báo cáo phân tích compact

Xuất báo cáo Markdown (không ghi file) với cấu trúc sau:

## Báo cáo phân tích đặc tả

| ID | Danh mục | Mức độ | Vị trí | Tóm tắt | Khuyến nghị |
|----|----------|---------|--------|---------|-------------|
| A1 | Trùng lặp | CAO | spec.md:L120-134 | Hai yêu cầu tương tự... | Hợp nhất cách diễn đạt; giữ phiên bản rõ hơn |

(Thêm một dòng cho mỗi phát hiện; tạo ID ổn định có tiền tố là chữ cái đầu của danh mục.)

**Bảng tóm tắt phủ sóng:**

| Key yêu cầu | Có task? | ID task | Ghi chú |
|-------------|----------|---------|---------|

**Vấn đề liên kết hiến pháp:** (nếu có)

**Tasks không được ánh xạ:** (nếu có)

**Số liệu:**

- Tổng yêu cầu
- Tổng task
- % phủ sóng (yêu cầu có >=1 task)
- Số lượng mơ hồ
- Số lượng trùng lặp
- Số vấn đề nghiêm trọng

### 7. Cung cấp hành động tiếp theo

Ở cuối báo cáo, xuất khối Hành động tiếp theo ngắn gọn:

- Nếu có vấn đề NGHIÊM TRỌNG: Khuyến nghị giải quyết trước `/speckit.implement`
- Nếu chỉ có THẤP/TRUNG BÌNH: Người dùng có thể tiếp tục, nhưng cung cấp đề xuất cải tiến
- Cung cấp gợi ý lệnh rõ ràng: ví dụ, "Chạy /speckit.specify với tinh chỉnh", "Chạy /speckit.plan để điều chỉnh kiến trúc", "Chỉnh sửa tasks.md thủ công để thêm phủ sóng cho 'performance-metrics'"

### 8. Đề xuất khắc phục

Hỏi người dùng: "Bạn có muốn tôi đề xuất các chỉnh sửa khắc phục cụ thể cho N vấn đề hàng đầu không?" (KHÔNG tự động áp dụng chúng.)

## Nguyên tắc vận hành

### Hiệu quả ngữ cảnh

- **Token tín hiệu cao tối thiểu**: Tập trung vào phát hiện có thể hành động, không phải tài liệu toàn diện
- **Tiết lộ tiến dần**: Tải artifact tăng dần; không đổ toàn bộ nội dung vào phân tích
- **Đầu ra tiết kiệm token**: Giới hạn bảng phát hiện 50 dòng; tóm tắt phần bổ sung
- **Kết quả xác định**: Chạy lại mà không có thay đổi sẽ tạo ra ID và số lượng nhất quán

### Hướng dẫn phân tích

- **KHÔNG BAO GIỜ sửa đổi file** (đây là phân tích chỉ đọc)
- **KHÔNG BAO GIỜ bịa ra phần bị thiếu** (nếu vắng mặt, báo cáo chính xác)
- **Ưu tiên vi phạm hiến pháp** (đây luôn là NGHIÊM TRỌNG)
- **Sử dụng ví dụ thay vì quy tắc toàn diện** (trích dẫn trường hợp cụ thể, không phải mẫu chung)
- **Báo cáo零 vấn đề một cách khéo léo** (xuất báo cáo thành công với số liệu thống kê phủ sóng)

## Ngữ cảnh

$ARGUMENTS
