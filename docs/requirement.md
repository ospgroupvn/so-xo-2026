# Hệ thống theo dõi kết quả sổ xố và thông báo người trúng giải.

## Context project

Nhân dịp năm mới, một số lượng người nhất định được tặng một loạt các cặp vé số Max 3D+. Xem kết quả ở đây https://xskt.com.vn/xsmax3d

Hiện tại cần một hệ thống khi đến giờ quay số 6h30 2 ngày 1 lần sẽ tự động kiểm tra kết quả xổ số và thông báo cho những người trúng giải.

Những người được tặng vé số sẽ truy cập ứng dụng này, ứng dụng cung cấp giao diện cho phép người dùng nhập các vé số của họ vào để theo dõi và thông báo trúng thường.

Khi đến 6h30, cứ định kỳ 1 phút sẽ quét kết quả 1 lần cho đến khi có hết các con số được quay. Khi có kết quả, hệ thống sẽ so sánh với các vé số đã nhập và thông báo cho người dùng nếu họ trúng giải.

## Luật

Mỗi vé số là một bộ 3 số có 3 chữ số. Ví dụ 123 456

Giải nhất / giải đặc biệt (1 tỷ): quay 1 bộ số
Giải nhì (40 triệu): quay 2 bộ số
Giải ba (10 triệu): quay 3 bộ số
Giải tư (5 triệu): quay 4 bộ số
Giải năm (1 triệu): Trùng khớp 2 bộ số bất kỳ trong toàn bộ 20 bộ số trên.
Giải sáu (150k): Trùng khớp 1 bộ số trong 2 bộ số của giải nhất.
Giải bảy (40k): Trùng khớp 1 bộ số bất kỳ trong 18 bộ số của giải nhì, giải ba và giải tư.

## Cách lấy kết quả

Sử dụng curl đến https://xskt.com.vn/xsmax3d, sau đó phân tích mã html trả về, lưu lại kết quả vào cloudflare workers KV để so sánh với vé số của người dùng.

Bóc tách thông tin từ html element có class "box-ketqua" đầu tiên, sau đó lấy tất cả các bộ số và lưu về cloudflare kv worker nếu có số mới.

## Lưu trữ lại các bộ số mà người đã đăng ký

- Tên người dùng
- Danh sách các bộ số đã đăng ký (hỗ trợ nhập nhiều, giao diện trực quan, có thể thao tác nhập bàn phím toàn phần dễ dàng di chuyển qua lại giữa các bộ số, hiển thị kiểu như OTP, các số thể hiện nổi bật, rõ ràng)

## Dashboard xem kết quả chung

Có một dashboard để tất cả các người dùng có thể xem chung kết quả quay số, cùng thông tin trúng giải (nếu có), cùng các bộ số mà tất cả mọi người đã đăng ký (tất cả đều công khai, không có private).

Dashboard sẽ hiển thị kết quả của ngày quay số hôm đó, không cần lấy thông tin của ngày quay số hôm trước.

## Tính năng gửi thông báo nếu có người trúng giải qua lark webhook

Thông tin lark webhook gửi đến https://open.larksuite.com/open-apis/bot/v2/hook/e20f9c1c-a055-4ccb-8518-77239584316f

Cú pháp lark thì search trên context7 mcp để nắm được cú pháp.

Thông tin webhook này sẽ được lưu lại là secret trên cloudflare KV.

## Lưu ý khác
- Sử dụng giao diện hiện tại, trực quan, cập nhật thời gian thực (qua hình thức request pooling) để hiển thị kết quả quay số và thông báo trúng giải cho người dùng.
- Thời gian quay số là 6h30, nên đến lúc đó mới cần truy xuất thông tin để cập nhật kết quả, và dừng lại khi đã có kết quả đầy đủ. Không cần truy xuất thông tin trước thời gian quay số.

## Cách test

Hãy tạo một bộ test với dữ liệu ngày cũ, và 1 bộ test với dữ liệu mô phỏng cứ một khoảng thời gian trả về một bộ số cho đến khi hết.

Để đảm bảo cho các tính năng hoạt động.

## Techstack

- Frontend: React, shadcn/ui, tailwindcss
- Backend: NodeJS, Cloudflare Workers
- Database: Cloudflare Workers KV
- Notification: Lark Webhook