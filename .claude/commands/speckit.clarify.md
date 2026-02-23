---
description: Xác định các vùng chưa được quy định rõ trong feature spec hiện hành bằng cách đặt tối đa 5 câu hỏi làm rõ có trọng tâm cao và mã hóa các câu trả lời lại vào spec.
handoffs:
  - label: Xây dựng Kế hoạch Kỹ thuật
    agent: speckit.plan
    prompt: Tạo kế hoạch cho spec. Tôi đang xây dựng với...
---

## Đầu vào của Người dùng

```text
$ARGUMENTS
```

Bạn **BẮT BUỘC** phải xem xét đầu vào của người dùng trước khi tiếp tục (nếu không rỗng).

## Tóm tắt

Mục tiêu: Phát hiện và giảm thiểu tính mơ hồ hoặc các điểm ra quyết định còn thiếu trong đặc tả tính năng đang hoạt động và ghi lại các làm rõ trực tiếp vào file spec.

Lưu ý: Quy trình làm rõ này được mong đợi chạy (và hoàn thành) TRƯỚC khi gọi `/speckit.plan`. Nếu người dùng tuyên bố rõ ràng họ đang bỏ qua bước làm rõ (ví dụ: exploratory spike), bạn có thể tiếp tục, nhưng phải cảnh báo rằng rủi ro công việc lại ở giai đoạn sau sẽ tăng lên.

Các bước thực thi:

1. Chạy `.specify/scripts/bash/check-prerequisites.sh --json --paths-only` từ root repo **một lần duy nhất** (chế độ kết hợp `--json --paths-only` / `-Json -PathsOnly`). Phân tích các trường JSON tối thiểu:
   - `FEATURE_DIR`
   - `FEATURE_SPEC`
   - (Tùy chọn capturing `IMPL_PLAN`, `TASKS` cho các luồng chuỗi tiếp theo.)
   - Nếu phân tích JSON thất bại, hủy bỏ và hướng dẫn người dùng chạy lại `/speckit.specify` hoặc xác minh môi trường feature branch.
   - Đối với single quotes trong args như "I'm Groot", sử dụng escape syntax: e.g 'I'\''m Groot' (hoặc double-quote nếu có thể: "I'm Groot").

2. Tải file spec hiện tại. Thực hiện quét tính mơ hồ & phạm vi theo cấu trúc sử dụng taxonomy này. Đối với mỗi danh mục, đánh dấu trạng thái: Rõ ràng / Một phần / Thiếu. Tạo bản đồ phạm vi nội bộ được sử dụng để ưu tiên (không xuất bản bản đồ thuale trừ khi không có câu hỏi nào được đặt).

   Phạm vi Chức năng & Hành vi:
   - Mục tiêu người dùng chính & tiêu chí thành công
   - Tuyên bố out-of-scope rõ ràng
   - Phân biệt vai trò người dùng / personas

   Miền & Mô hình Dữ liệu:
   - Thực thể, thuộc tính, quan hệ
   - Quy tắc định danh & tính duy nhất
   - Vòng đời / chuyển đổi trạng thái
   - Giả định quy mô dữ liệu / khối lượng

   Tương tác & Luồng UX:
   - Hành trình người dùng quan trọng / trình tự
   - Trạng thái lỗi / rỗng / đang tải
   - Ghi chú accessibility hoặc localization

   Thuộc tính Chất lượng Phi chức năng:
   - Hiệu năng (mục tiêu độ trễ, thông lượng)
   - Khả năng mở rộng (ngang/dọc, giới hạn)
   - Độ tin cậy & khả năng sử dụng (thời gian hoạt động, kỳ vọng phục hồi)
   - Khả năng quan sát (logging, metrics, tín hiệu tracing)
   - Bảo mật & quyền riêng tư (authN/Z, bảo vệ dữ liệu, giả định mối đe dọa)
   - Ràng buộc tuân thủ / quy định (nếu có)

   Tích hợp & Phụ thuộc Bên ngoài:
   - Dịch vụ/API bên ngoài và chế độ lỗi
   - Định dạng nhập/xuất dữ liệu
   - Giả định giao thức / phiên bản

   Trường hợp Đặc biệt & Xử lý Lỗi:
   - Kịch bản tiêu cực
   - Giới hạn tốc độ / throttling
   - Giải quyết xung đột (ví dụ: chỉnh sửa đồng thời)

   Ràng buộc & Sự đánh đổi:
   - Ràng buộc kỹ thuật (ngôn ngữ, lưu trữ, hosting)
   - Sự đánh đổi rõ ràng hoặc các lựa chọn thay thế bị từ chối

   Thuật ngữ & Tính nhất quán:
   - Thuật ngữ bảng chú giải chuẩn
   - Từ đồng nghĩa bị tránh / thuật ngữ đã lỗi thời

   Tín hiệu Hoàn thành:
   - Khả năng kiểm tra tiêu chí chấp nhận
   - Chỉ đo lường được kiểu Định nghĩa Hoàn thành

   Khác / Placeholder:
   - Marker TODO / quyết định chưa giải quyết
   - Tính từ mơ hồ ("mạnh mẽ", "trực quan") thiếu định lượng

   Đối với mỗi danh mục có trạng thái Một phần hoặc Thiếu, thêm cơ hội câu hỏi ứng viên trừ khi:
   - Làm rõ sẽ không thay đổi đáng kể chiến lược triển khai hoặc xác thực
   - Thông tin tốt hơn nên được trì hoãn đến giai đoạn lập kế hoạch (ghi chú nội bộ)

3. Tạo (nội bộ) hàng đợi các câu hỏi làm rõ ứng viên được ưu tiên (tối đa 5). KHÔNG xuất tất cả cùng một lúc. Áp dụng các ràng buộc này:
    - Tối đa 10 câu hỏi tổng cộng trong toàn bộ phiên.
    - Mỗi câu hỏi phải có thể trả lời với:
       - Một lựa chọn multiple-choice ngắn (2-5 lựa chọn riêng biệt, loại trừ lẫn nhau), HOẶC
       - Một câu trả lời một từ / cụm từ ngắn (ràng buộc rõ ràng: "Trả lời <=5 từ").
    - Chỉ bao gồm các câu hỏi mà câu trả lời tác động đáng kể đến kiến trúc, mô hình hóa dữ liệu, phân tích nhiệm vụ, thiết kế kiểm tra, hành vi UX, sẵn sàng vận hành, hoặc xác thực tuân thủ.
    - Đảm bảo cân bằng phạm vi danh mục: cố gắng bao phủ các danh mục chưa giải quyết có tác động cao nhất đầu tiên; tránh đặt hai câu hỏi tác động thấp khi một khu vực tác động cao (ví dụ: trạng thái bảo mật) chưa được giải quyết.
    - Loại trừ các câu hỏi đã được trả lời, ưu tiên kiểu mẫu tầm thường, hoặc chi tiết thực thi ở mức kế hoạch (trừ khi chặn đúng đắn).
    - Ưu tiên các làm rõ giảm rủi ro công việc lại ở giai đoạn sau hoặc ngăn ngừa thử nghiệm chấp nhận không đồng nhất.
    - Nếu hơn 5 danh mục còn chưa giải quyết, chọn top 5 theo heuristic (Tác động * Không chắc chắn).

4. Vòng lặp đặt câu hỏi tuần tự (tương tác):
    - Trình bày CHÍNH XÁC MỘT câu hỏi tại một thời điểm.
    - Đối với câu hỏi multiple-choice:
       - **Phân tích tất cả các lựa chọn** và xác định **lựa chọn phù hợp nhất** dựa trên:
          - Thực hành tốt nhất cho loại dự án
          - Mẫu phổ biến trong các triển khai tương tự
          - Giảm rủi ro (bảo mật, hiệu năng, khả năng bảo trì)
          - Độ phù hợp với bất kỳ mục tiêu hoặc ràng buộc dự án rõ ràng nào có thể nhìn thấy trong spec
       - Trình bày **lựa chọn được đề xuất của bạn nổi bật ở trên cùng** với lý do rõ ràng (1-2 câu giải thích tại sao đây là lựa chọn tốt nhất).
       - Định dạng sebagai: `**Đề xuất:** Lựa chọn [X] - <lý do>`
       - Sau đó hiển thị tất cả các lựa chọn sebagai bảng Markdown:

       | Lựa chọn | Mô tả |
       |--------|-------------|
       | A | <Mô tả lựa chọn A> |
       | B | <Mô tả lựa chọn B> |
       | C | <Mô tả lựa chọn C> (thêm D/E nếu cần lên đến 5) |
       | Ngắn | Cung cấp câu trả lời ngắn khác (<=5 từ) (Chỉ bao gồm nếu thay thế tự do phù hợp) |

       - Sau bảng, thêm: `Bạn có thể trả lời bằng chữ cái lựa chọn (ví dụ "A"), chấp nhận đề xuất bằng cách nói "yes" hoặc "recommended", hoặc cung cấp câu trả lời ngắn của riêng bạn.`
    - Đối với kiểu câu trả lời ngắn (không có lựa chọn rời rạc có ý nghĩa):
       - Cung cấp **câu trả lời đề xuất của bạn** dựa trên thực hành tốt nhất và bối cảnh.
       - Định dạng sebagai: `**Đề xuất:** <câu trả lời đề xuất của bạn> - <lý do ngắn>`
       - Sau đó xuất: `Định dạng: Câu trả lời ngắn (<=5 từ). Bạn có thể chấp nhận đề xuất bằng cách nói "yes" hoặc "suggested", hoặc cung cấp câu trả lời của riêng bạn.`
    - Sau khi người dùng trả lời:
       - Nếu người dùng trả lời "yes", "recommended", hoặc "suggested", sử dụng đề xuất/gợi ý trước đó của bạn sebagai câu trả lời.
       - Ngược lại, xác thực câu trả lời ánh xạ đến một lựa chọn hoặc phù hợp với ràng buộc <=5 từ.
       - Nếu mơ hồ, yêu cầu làm rõ nhanh (vẫn tính sebagai cùng một câu hỏi; không tiến tới).
       - Khi đạt đủ, ghi lại vào bộ nhớ làm việc (chưa ghi vào đĩa) và chuyển đến câu hỏi được xếp hàng tiếp theo.
    - Dừng đặt thêm câu hỏi khi:
       - Tất cả các mơ hồ quan trọng được giải quyết sớm (các mục được xếp hàng còn lại trở nên không cần thiết), HOẶC
       - Người dùng tín hiệu hoàn thành ("done", "good", "no more"), HOẶC
       - Bạn đạt 5 câu hỏi đã đặt.
    - Không bao giờ tiết lộ các câu hỏi được xếp hàng trong tương lai trước.
    - Nếu không có câu hỏi hợp lệ nào tồn tại ở đầu, báo cáo ngay lập tức không có mơ hồ quan trọng.

5. Tích hợp sau MỖI câu trả lời được chấp nhận (cách tiếp cận cập nhật gia tăng):
    - Duy trì biểu diễn trong bộ nhớ của spec (được tải một lần ở đầu) cộng với nội dung file thô.
    - Đối với câu trả lời tích hợp đầu tiên trong phiên này:
       - Đảm bảo phần `## Clarifications` tồn tại (tạo nó ngay sau phần bối cảnh/tổng quan cấp cao nhất theo mẫu spec nếu thiếu).
       - Dưới nó, tạo (nếu chưa có) tiểu đề `### Session YYYY-MM-DD` cho hôm nay.
    - Thêm dòng bullet ngay sau khi chấp nhận: `- Q: <câu hỏi> → A: <câu trả lời cuối cùng>`.
    - Sau đó áp dụng ngay lập tức làm rõ đến phần phù hợp nhất:
       - Mơ hồ chức năng → Cập nhật hoặc thêm bullet trong Yêu cầu Chức năng.
       - Tương tác người dùng / phân biệt diễn viên → Cập nhật User Stories hoặc tiểu đề Actors (nếu có) với vai trò, ràng buộc, hoặc kịch bản đã làm rõ.
       - Hình dạng dữ liệu / thực thể → Cập nhật Mô hình Dữ liệu (thêm trường, kiểu, quan hệ) bảo toàn thứ tự; ghi chú các ràng buộc được thêm ngắn gọn.
       - Ràng buộc phi chức năng → Thêm/sửa đổi tiêu chí có thể đo lường trong phần Phi chức năng / Thuộc tính Chất lượng (chuyển tính từ mơ hồ thành số liệu hoặc mục tiêu rõ ràng).
       - Trường hợp đặc biệt / luồng tiêu cực → Thêm bullet mới dưới Trường hợp Đặc biệt / Xử lý Lỗi (hoặc tạo tiểu đề như vậy nếu mẫu cung cấp placeholder cho nó).
       - Xung đột thuật ngữ → Chuẩn hóa thuật ngữ trên toàn bộ spec; giữ nguyên gốc chỉ nếu cần thiết bằng cách thêm `(trước đây được gọi là "X")` một lần.
    - Nếu làm rõ làm vô hiệu tuyên bố mơ hồ trước đó, thay thế tuyên bố đó thay vì trùng lặp; không để lại văn bản contradictory lỗi thời.
    - Lưu file spec SAU mỗi tích hợp để giảm thiểu rủi ro mất ngữ cảnh (ghi đè nguyên tử).
    - Bảo toàn định dạng: không sắp xếp lại các phần không liên quan; giữ nguyên thứ bậc heading.
    - Giữ mỗi làm rõ được chèn tối thiểu và có thể kiểm tra (tránh drift tường thuật).

6. Xác thực (thực hiện sau MỖI lần ghi cộng với lần cuối):
   - Phiên làm rõ chứa chính xác một bullet cho mỗi câu trả lời được chấp nhận (không trùng lặp).
   - Tổng số câu hỏi được đặt (được chấp nhận) ≤ 5.
   - Các phần được cập nhật không chứa placeholder mơ hồ lơ lửng mà câu trả lời mới được dự định giải quyết.
   - Không có tuyên bố contradictory trước đó còn lại (quét để xóa các lựa chọn thay thế không còn hợp lệ).
   - Cấu trúc Markdown hợp lệ; chỉ cho phép heading mới: `## Clarifications`, `### Session YYYY-MM-DD`.
   - Tính nhất quán thuật ngữ: cùng thuật ngữ chuẩn được sử dụng trên tất cả các phần được cập nhật.

7. Ghi spec đã cập nhật lại vào `FEATURE_SPEC`.

8. Báo cáo hoàn thành (sau khi vòng lặp đặt câu hỏi kết thúc hoặc chấm dứt sớm):
   - Số lượng câu hỏi được đặt & được trả lời.
   - Đường dẫn đến spec đã cập nhật.
   - Các phần được chạm (liệt kê tên).
   - Bảng tóm tắt phạm vi liệt kê mỗi danh mục taxonomy với Trạng thái: Đã giải quyết (là Một phần/Thiếu và đã được giải quyết), Trì hoãn (vượt quá hạn ngạch câu hỏi hoặc phù hợp hơn để lập kế hoạch), Rõ ràng (đã đủ), Tuyệt vời (vẫn Một phần/Thiếu nhưng tác động thấp).
   - Nếu còn lại bất kỳ Tuyệt vời hoặc Trì hoãn, khuyến nghị có nên tiếp tục đến `/speckit.plan` hay chạy `/speckit.clarify` lại sau post-plan.
   - Lệnh tiếp theo được đề xuất.

Quy tắc hành vi:

- Nếu không tìm thấy mơ hồ có ý nghĩa nào (hoặc tất cả các câu hỏi tiềm năng sẽ có tác động thấp), phản hồi: "Không phát hiện mơ hồ quan trọng nào đáng để làm rõ hình thức." và đề xuất tiếp tục.
- Nếu file spec thiếu, hướng dẫn người dùng chạy `/speckit.specify` trước (không tạo spec mới ở đây).
- Không bao giờ vượt quá 5 câu hỏi được đặt tổng cộng (các lần thử lại làm rõ cho một câu hỏi duy nhất không tính sebagai câu hỏi mới).
- Tránh các câu hỏi tech stack suy đoán trừ khi sự thiếu vắng chặn sự rõ ràng chức năng.
- Tôn trọng tín hiệu chấm dứt sớm của người dùng ("stop", "done", "proceed").
- Nếu không có câu hỏi nào được đặt do phạm vi đầy đủ, xuất bản bản tóm tắt phạm vi nhỏ gọn (tất cả các danh mục Rõ ràng) sau đó đề xuất tiến lên.
- Nếu đạt hạn ngạch với các danh mục tác động cao chưa được giải quyết còn lại, gắn cờ rõ ràng chúng dưới Trì hoãn với lý do.

Bối cảnh để ưu tiên: $ARGUMENTS
