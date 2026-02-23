# Feature Specification: Hệ Thống Theo Dõi Xổ Số Max 3D+

**Feature Branch**: `001-lottery-tracker`
**Created**: 2026-02-23
**Status**: Draft
**Input**: User description: "Hệ thống theo dõi kết quả xổ số Max 3D+ và thông báo người trúng giải"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Đăng Ký Vé Số (Priority: P1)

Người dùng truy cập ứng dụng và nhập các bộ số vé Max 3D+ của mình vào hệ thống để theo dõi. Mỗi vé gồm 2 bộ số, mỗi bộ có 3 chữ số (ví dụ: 123 456). Giao diện nhập liệu trực quan, dễ sử dụng với bàn phím, hiển thị các số nổi bật theo kiểu OTP.

**Why this priority**: Đây là tính năng cốt lõi - không có dữ liệu vé số thì không thể so khớp kết quả. Là bước đầu tiên trong user journey.

**Independent Test**: Người dùng có thể mở ứng dụng, nhập tên và các bộ số, lưu thành công. Dữ liệu hiển thị đúng trên dashboard.

**Acceptance Scenarios**:

1. **Given** người dùng truy cập trang đăng ký vé số, **When** nhập tên "Nguyễn Văn A" và 2 bộ số "123" và "456", **Then** hệ thống lưu thông tin và hiển thị trên dashboard
2. **Given** người dùng đã nhập 1 bộ số, **When** nhấn Tab hoặc Enter, **Then** con trỏ di chuyển đến bộ số tiếp theo
3. **Given** người dùng nhập bộ số không hợp lệ (không đủ 3 chữ số, ký tự không phải số, hoặc số âm), **When** cố gắng lưu, **Then** hệ thống hiển thị thông báo lỗi và yêu cầu sửa
4. **Given** người dùng nhập vé số đã có người khác đăng ký (ví dụ "123 456"), **When** cố gắng lưu, **Then** hệ thống từ chối và thông báo vé số đã tồn tại
5. **Given** người dùng nhập bộ số hợp lệ (mỗi chữ số từ 0-9), **When** lưu, **Then** hệ thống chấp nhận và lưu thành công
6. **Given** người dùng đã đăng ký vé số, **When** quay lại trang sau đó, **Then** thấy thông tin vé số của mình vẫn được lưu

---

### User Story 2 - Tự Động Lấy Kết Quả Quay Số (Priority: P1)

Vào lúc 18h10 (GMT+7) các ngày có quay số (2 ngày/lần), hệ thống tự động bắt đầu lấy kết quả từ nguồn xổ số. Hệ thống quét định kỳ mỗi 1 phút cho đến khi có đủ 20 bộ số kết quả. Kết quả được lưu vào kho dữ liệu để so sánh.

**Why this priority**: Tính năng backend cốt lõi - không có kết quả thì không thể so khớp và thông báo trúng giải.

**Independent Test**: Đến thời điểm quay số, hệ thống tự động fetch dữ liệu, parse HTML, lưu kết quả vào storage. Có thể test với dữ liệu lịch sử hoặc mô phỏng.

**Acceptance Scenarios**:

1. **Given** đến 18h10 (GMT+7) ngày có quay số, **When** hệ thống bắt đầu chạy, **Then** fetch HTML từ nguồn xổ số và parse kết quả
2. **Given** hệ thống đã lấy được một số bộ số, **When** chưa đủ 20 bộ, **Then** tiếp tục quét sau 1 phút
3. **Given** hệ thống đã lấy đủ 20 bộ số, **When** hoàn thành, **Then** dừng quét và lưu kết quả vào storage
4. **Given** nguồn xổ số không phản hồi hoặc lỗi, **When** xảy ra lỗi, **Then** thử lại sau 1 phút (tối đa 3 lần)

---

### User Story 3 - So Khớp Vé Số Và Thông Báo Trúng Giải (Priority: P1)

Ngay khi hệ thống lấy được một bộ số kết quả mới (không cần chờ đủ 20 bộ), hệ thống lập tức so khớp vé số đã đăng ký với kết quả theo luật giải thưởng. Nếu có người trúng giải, hệ thống gửi thông báo qua Lark webhook VÀ hiển thị nổi bật trên dashboard ngay lập tức.

**Why this priority**: Đây là giá trị cốt lõi của hệ thống - thông báo trúng giải cho người dùng ngay khi có kết quả, tạo trải nghiệm hồi hộp và phấn khích.

**Independent Test**: Với dữ liệu kết quả và vé số đã nhập, hệ thống tính toán giải thưởng đúng theo luật, gửi thông báo webhook, hiển thị kết quả nổi bật trên dashboard ngay khi có số mới.

**Acceptance Scenarios**:

1. **Given** hệ thống vừa lấy được 1 bộ số mới, **When** so khớp, **Then** ngay lập tức kiểm tra và thông báo nếu có người trúng giải
2. **Given** có người trúng giải nhất (trùng khớp 2 bộ số với giải nhất), **When** phát hiện, **Then** gửi thông báo Lark webhook VÀ hiển thị nổi bật trên dashboard
3. **Given** có người trúng giải năm (trùng khớp 2 bộ số bất kỳ trong các bộ đã quay), **When** phát hiện, **Then** ghi nhận và thông báo ngay lập tức
4. **Given** chưa có ai trúng giải, **When** có số mới, **Then** dashboard hiển thị trạng thái "chưa trúng" nhưng không gửi webhook
5. **Given** đang trong lúc quay số, **When** có người trúng giải, **Then** dashboard làm nổi bật thông tin trúng giải (animation/highlight) để thu hút sự chú ý

---

### User Story 4 - Dashboard Xem Kết Quả Chung (Priority: P2)

Tất cả người dùng có thể xem dashboard hiển thị kết quả quay số của ngày hôm đó, danh sách tất cả vé số đã đăng ký, và thông tin trúng giải. Dashboard cập nhật thời gian thực khi có kết quả mới.

**Why this priority**: Cung cấp trải nghiệm cộng đồng, cho phép mọi người theo dõi kết quả cùng lúc. Không bắt buộc cho MVP nhưng tăng giá trị trải nghiệm.

**Independent Test**: Mở dashboard, thấy kết quả quay số cập nhật, thấy tất cả vé số đã đăng ký, thấy ai trúng giải.

**Acceptance Scenarios**:

1. **Given** người dùng truy cập dashboard, **When** trang tải xong, **Then** hiển thị kết quả quay số của ngày hôm đó (nếu có)
2. **Given** đang trong lúc quay số (18h10 GMT+7), **When** có kết quả mới, **Then** dashboard tự động cập nhật mà không cần refresh trang
3. **Given** dashboard đang hiển thị, **When** xem danh sách vé số, **Then** thấy tất cả vé số của mọi người (công khai, không private)
4. **Given** có người trúng giải, **When** xem dashboard, **Then** hiển thị thông tin trúng giải nổi bật

---

### Edge Cases

- **Không có kết quả**: Khi đến 18h10 (GMT+7) nhưng nguồn xổ số chưa có kết quả, hệ thống tiếp tục quét mỗi phút cho đến khi có hoặc hết giờ (ví dụ: 19h10)
- **Lỗi nguồn dữ liệu**: Khi nguồn xổ số không khả dụng, hệ thống thử lại tối đa 3 lần, ghi log lỗi
- **Nhập vé số trùng lặp**: Người dùng nhập vé số đã có người khác đăng ký, hệ thống từ chối và yêu cầu nhập vé khác
- **Kết quả không đầy đủ**: Khi chỉ lấy được một phần kết quả, hệ thống vẫn so khớp với phần đã có và thông báo ngay lập tức
- **Người dùng nhập sai định dạng**: Bộ số không đủ 3 chữ số, có ký tự không hợp lệ, hoặc số âm, hiển thị thông báo lỗi cụ thể
- **Thông báo trùng lặp**: Nếu cùng một người trúng nhiều giải trong các lần fetch khác nhau, chỉ thông báo một lần cho mỗi giải

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: Hệ thống PHẢI cho phép người dùng nhập tên và danh sách các bộ số vé (mỗi bộ 3 chữ số)
- **FR-002**: Hệ thống PHẢI hỗ trợ nhập nhiều bộ số với giao diện kiểu OTP, dễ thao tác với bàn phím
- **FR-003**: Hệ thống PHẢI validation vé số:
  - Mỗi chữ số từ 0 đến 9 (không có số âm, không có ký tự)
  - Mỗi bộ phải đủ 3 chữ số
  - Vé số không được trùng với người khác đã đăng ký
- **FR-004**: Hệ thống PHẢI tự động lấy kết quả xổ số vào lúc 18h10 (GMT+7) các ngày quay số bằng cách:
  - Sử dụng HTTP request đến https://xskt.com.vn/xsmax3d
  - Bóc tách thẻ HTML có class "box-ketqua" đầu tiên
  - Chi tiết cấu trúc HTML và logic parse sẽ được xác định trong giai đoạn plan (sau khi fetch và phân tích mẫu thực tế)
- **FR-005**: Hệ thống PHẢI quét định kỳ mỗi 1 phút cho đến khi có đủ 20 bộ số kết quả
- **FR-006**: Hệ thống PHẢI lưu kết quả vào storage để so khớp với vé số người dùng
- **FR-007**: Hệ thống PHẢI so khớp vé số NGAY KHI có bộ số mới (không chờ đủ 20 bộ):
  - Giải nhất: Trùng khớp 2 bộ số với giải nhất (1 bộ số được quay)
  - Giải nhì: Trùng khớp 2 bộ số với giải nhì (2 bộ số được quay)
  - Giải ba: Trùng khớp 2 bộ số với giải ba (3 bộ số được quay)
  - Giải tư: Trùng khớp 2 bộ số với giải tư (4 bộ số được quay)
  - Giải năm: Trùng khớp 2 bộ số bất kỳ trong toàn bộ 20 bộ số
  - Giải sáu: Trùng khớp 1 bộ số trong 2 bộ số của giải nhất
  - Giải bảy: Trùng khớp 1 bộ số bất kỳ trong 18 bộ số của giải nhì, giải ba và giải tư
- **FR-008**: Hệ thống PHẢI gửi thông báo ĐÔNG THỜI khi có người trúng giải:
  - Gửi thông báo qua Lark webhook
  - Hiển thị nổi bật trên dashboard (animation/highlight)
- **FR-009**: Hệ thống PHẢI lưu Lark webhook URL dưới dạng secret, không hardcode
- **FR-010**: Hệ thống PHẢI hiển thị dashboard công khai với kết quả quay số và tất cả vé số đã đăng ký
- **FR-011**: Dashboard PHẢI cập nhật thời gian thực khi có kết quả mới (request polling)
- **FR-012**: Hệ thống PHẢI hiển thị kết quả của ngày quay số hôm đó, không cần dữ liệu ngày trước

### Key Entities

- **Người Dùng (Participant)**: Đại diện cho một người được tặng vé số. Có tên và danh sách các vé số đã đăng ký.
- **Vé Số (Ticket)**: Một vé Max 3D+ gồm 2 bộ số, mỗi bộ có 3 chữ số (ví dụ: 123 456). Liên kết với một người dùng.
- **Kết Quả Quay Số (DrawResult)**: Kết quả của một buổi quay số. Bao gồm 20 bộ số được chia thành các giải (nhất, nhì, ba, tư) và ngày quay.
- **Thông Báo Trúng Giải (WinNotification)**: Thông tin về người trúng giải, giải thưởng, và thời điểm. Được gửi qua webhook.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Người dùng có thể nhập vé số và lưu thành công trong vòng 30 giây
- **SC-002**: Hệ thống lấy được kết quả đầy đủ 20 bộ số trong vòng 15 phút từ lúc bắt đầu quay (18h10 GMT+7)
- **SC-003**: Dashboard cập nhật kết quả mới trong vòng 5 giây sau khi hệ thống lấy được
- **SC-004**: 100% vé số trúng giải được phát hiện và thông báo chính xác
- **SC-005**: Thông báo webhook được gửi thành công trong vòng 10 giây sau khi xác định trúng giải
- **SC-006**: Giao diện nhập vé số hoạt động mượt mà với 100% thao tác bàn phím (không cần chuột)

## Assumptions

- Nguồn xổ số https://xskt.com.vn/xsmax3d luôn khả dụng trong giờ quay số
- Cấu trúc HTML của trang kết quả không thay đổi thường xuyên
- Lark webhook URL được cung cấp sẵn và hợp lệ
- Tất cả dữ liệu là công khai, không yêu cầu bảo mật riêng tư
- Số lượng người dùng và vé số nhỏ (dưới 100 người, dưới 500 vé)
- Người dùng không cần đăng nhập/đăng ký tài khoản

## Out of Scope

- Lưu trữ lịch sử kết quả các ngày trước
- Đăng ký/đăng nhập tài khoản người dùng
- Thông báo qua email, SMS, push notification
- Ứng dụng di động native
- Thanh toán hoặc tính năng tài chính
