---
description: Tạo danh sách kiểm tùy chỉnh cho tính năng hiện tại dựa trên yêu cầu của người dùng.
---

## Mục đích của Checklist: "Unit Test cho Tiếng Anh"

**KHÁI NIỆM QUAN TRỌNG**: Checklist là **UNIT TEST CHO VIỆC VIẾT YÊU CẦU** - nó kiểm tra chất lượng, độ rõ ràng và tính đầy đủ của các yêu cầu trong một lĩnh vực nhất định.

**KHÔNG dùng để xác minh/kiểm thử**:

- ❌ KHÔNG "Xác minh nút bấm hoạt động đúng"
- ❌ KHÔNG "Kiểm thử xử lý lỗi hoạt động"
- ❌ KHÔNG "Xác nhận API trả về 200"
- ❌ KHÔNG kiểm tra xem code/implementation có khớp với spec

**Dùng để kiểm tra chất lượng yêu cầu**:

- ✅ "Yêu cầu về phân cấp thị giác có được định nghĩa cho tất cả các loại thẻ không?" (tính đầy đủ)
- ✅ "'Hiển thị nổi bật' có được lượng hóa với kích thước/vị trí cụ thể không?" (độ rõ ràng)
- ✅ "Yêu cầu về trạng thái hover có nhất quán trên tất cả các phần tử tương tác không?" (tính nhất quán)
- ✅ "Yêu cầu về khả năng truy cập có được định nghĩa cho điều hướng bằng bàn phím không?" (độ phủ)
- ✅ "Spec có định nghĩa hành vi khi logo tải thất bại không?" (trường hợp ngoại lệ)

**Ẩn dụ**: Nếu spec của bạn là code được viết bằng tiếng Anh, thì checklist là bộ unit test của nó. Bạn đang kiểm tra xem yêu cầu có được viết tốt, đầy đủ, không mơ hồ và sẵn sàng để implement - KHÔNG phải kiểm tra xem implementation có hoạt động không.

## Đầu vào của Người dùng

```text
$ARGUMENTS
```

Bạn **BẮT BUỘC** phải xem xét đầu vào của người dùng trước khi tiếp tục (nếu không rỗng).

## Các bước Thực hiện

1. **Thiết lập**: Chạy `.specify/scripts/bash/check-prerequisites.sh --json` từ thư mục gốc repo và phân tích JSON để lấy FEATURE_DIR và danh sách AVAILABLE_DOCS.
   - Tất cả đường dẫn file phải là đường dẫn tuyệt đối.
   - Với dấu nháy đơn trong tham số như "I'm Groot", dùng cú pháp escape: ví dụ 'I'\''m Groot' (hoặc dùng dấu nháy kép nếu được: "I'm Groot").

2. **Làm rõ ý định (động)**: Đưa ra tối đa BA câu hỏi làm rõ ban đầu theo ngữ cảnh (không dùng danh sách có sẵn). Các câu hỏi PHẢI:
   - Được tạo từ cách diễn đạt của người dùng + các tín hiệu được trích xuất từ spec/plan/tasks
   - Chỉ hỏi về thông tin thực sự làm thay đổi nội dung checklist
   - Được bỏ qua riêng lẻ nếu đã rõ ràng trong `$ARGUMENTS`
   - Ưu tiên độ chính xác hơn là độ rộng

   Thuật toán tạo câu hỏi:
   1. Trích xuất tín hiệu: từ khóa lĩnh vực tính năng (ví dụ: auth, latency, UX, API), chỉ báo rủi ro ("critical", "must", "compliance"), gợi ý stakeholders ("QA", "review", "security team"), và deliverable rõ ràng ("a11y", "rollback", "contracts").
   2. Nhóm tín hiệu thành các khu vực trọng tâm ứng viên (tối đa 4) được xếp hạng theo độ liên quan.
   3. Xác định đối tượng & thời điểm có thể (tác giả, reviewer, QA, release) nếu chưa rõ.
   4. Phát hiện các khía cạnh còn thiếu: phạm vi rộng, độ sâu/chặt chẽ, nhấn mạnh rủi ro, giới loại trừ, tiêu chí chấp nhận đo được.
   5. Định dạng câu hỏi được chọn từ các nguyên mẫu này:
      - Làm rõ phạm vi (ví dụ: "Có nên bao gồm các điểm tích hợp với X và Y hay chỉ giới hạn trong tính đúng đắn của module cục bộ?")
      - Ưu tiên rủi ro (ví dụ: "Khu vực rủi ro nào trong số này nên được kiểm tra bắt buộc?")
      - Hiệu chỉnh độ sâu (ví dụ: "Đây là danh sách sanity pre-commit nhẹ hay một cổng release chính thức?")
      - Định khung đối tượng (ví dụ: "Điều này sẽ được dùng bởi tác giả hay đồng nghiệp trong PR review?")
      - Loại trừ giới hạn (ví dụ: "Có nên loại trừ rõ ràng các mục hiệu suất tuning trong vòng này?")
      - Khoảng trưng lớp kịch bản (ví dụ: "Không phát hiện luồng recovery—các đường dẫn rollback / failure một phần có trong phạm vi không?")

   Quy tắc định dạng câu hỏi:
   - Nếu trình bày tùy chọn, tạo bảng compact với các cột: Tùy chọn | Ứng viên | Tại sao Quan trọng
   - Giới hạn tối đa tùy chọn A–E; bỏ qua bảng nếu câu trả lời tự do rõ ràng hơn
   - Không bao giờ yêu cầu người dùng lặp lại những gì họ đã nói
   - Tránh các mục suy đoán (không hallucination). Nếu không chắc chắn, hỏi rõ: "Xác nhận xem X có thuộc phạm vi không."

   Mặc định khi không thể tương tác:
   - Độ sâu: Tiêu chuẩn
   - Đối tượng: Reviewer (PR) nếu liên quan đến code; Tác giả nếu không
   - Trọng tâm: Top 2 cụm liên quan

   Xuất ra các câu hỏi (đán hiệu Q1/Q2/Q3). Sau khi có câu trả lời: nếu ≥2 lớp kịch bản (Alternate / Exception / Recovery / Non-Functional domain) vẫn chưa rõ, bạn CÓ THỂ hỏi tối đa HAI câu hỏi theo dõi mục tiêu thêm (Q4/Q5) với mỗi dòng một lý do (ví dụ: "Rủi ro đường dẫn recovery chưa giải quyết"). Không vượt quá năm câu hỏi tổng cộng. Bỏ qua leo thang nếu người dùng từ chối thêm.

3. **Hiểu yêu cầu của người dùng**: Kết hợp `$ARGUMENTS` + câu trả lời làm rõ:
   - Đưa ra chủ đề checklist (ví dụ: security, review, deploy, ux)
   - Gộp các mục phải có được đề cập rõ bởi người dùng
   - Ánh xạ các lựa chọn trọng tâm vào khung danh mục
   - Suy luận ngữ cảnh còn thiếu từ spec/plan/tasks (KHÔNG hallucination)

4. **Tải ngữ cảnh tính năng**: Đọc từ FEATURE_DIR:
   - spec.md: Yêu cầu và phạm vi tính năng
   - plan.md (nếu có): Chi tiết kỹ thuật, dependencies
   - tasks.md (nếu có): Các tác vụ implementation

   **Chiến lược Tải ngữ cảnh**:
   - Chỉ tải các phần cần thiết liên quan đến các khu vực trọng tâm hoạt động (tránh việc đổ toàn bộ file)
   - Ưu tiên tóm tắt các phần dài thành các gạch đầu dòng kịch bản/yêu cầu ngắn gọn
   - Sử dụng tiết lộ tiến bộ: thêm truy xuất theo dõi chỉ khi phát hiện khoảng trống
   - Nếu tài liệu nguồn lớn, tạo các mục tóm tắt tạm thời thay vì nhúng văn bản thô

5. **Tạo checklist** - Tạo "Unit Test cho Yêu cầu":
   - Tạo thư mục `FEATURE_DIR/checklists/` nếu chưa tồn tại
   - Tạo tên file checklist độc nhất:
     - Dùng tên ngắn, mô tả dựa trên lĩnh vực (ví dụ: `ux.md`, `api.md`, `security.md`)
     - Định dạng: `[lĩnh vực].md`
     - Nếu file đã tồn tại, thêm vào file hiện có
   - Đánh số mục tuần tự bắt đầu từ CHK001
   - Mỗi lần chạy `/speckit.checklist` tạo một file MỚI (không bao giờ ghi đè checklist hiện có)

   **NGUYÊN TẮC CỐT LÕI - Kiểm tra Yêu cầu, Không phải Implementation**:
   Mọi mục checklist PHẢI đánh giá CHÍNH YÊU CẦU về:
   - **Độ đầy đủ**: Có phải tất cả yêu cầu cần thiết đều hiện diện?
   - **Độ rõ ràng**: Yêu cầu có không mơ hồ và cụ thể?
   - **Tính nhất quán**: Yêu cầu có phù hợp với nhau?
   - **Khả năng đo lường**: Yêu cầu có thể được xác minh khách quan?
   - **Độ phủ**: Có phải tất cả các kịch bản/trường hợp ngoại lệ đều được giải quyết?

   **Cấu trúc Danh mục** - Nhóm mục theo các chiều chất lượng yêu cầu:
   - **Độ đầy đủ của Yêu cầu** (Có phải tất cả yêu cầu cần thiết đều được ghi lại?)
   - **Độ rõ ràng của Yêu cầu** (Yêu cầu có cụ thể và không mơ hồ?)
   - **Tính nhất quán của Yêu cầu** (Yêu cầu có phù hợp không xung đột?)
   - **Chất lượng Tiêu chí Chấp nhận** (Tiêu chí thành công có đo được?)
   - **Độ phủ Kịch bản** (Có phải tất cả các luồng/trường hợp đều được giải quyết?)
   - **Độ phủ Trường hợp Ngoại lệ** (Các điều kiện biên có được định nghĩa?)
   - **Yêu cầu Phi Chức năng** (Hiệu suất, Bảo mật, Khả năng truy cập, v.v. - có được chỉ định?)
   - **Phụ thuộc & Giả định** (Chúng có được ghi lại và xác thực?)
   - **Sự mơ hồ & Xung đột** (Cần làm rõ gì?)

   **CÁCH VIẾT MỤC CHECKLIST - "Unit Test cho Tiếng Anh"**:

   ❌ **SAI** (Kiểm thử implementation):
   - "Xác minh trang hiển thị 3 thẻ tập phim"
   - "Kiểm thử trạng thái hover hoạt động trên desktop"
   - "Xác nhận click logo chuyển về trang chủ"

   ✅ **ĐÚNG** (Kiểm thử chất lượng yêu cầu):
   - "Số lượng và bố cục chính xác của các tập nổi bật có được chỉ định không?" [Độ đầy đủ]
   - "'Hiển thị nổi bật' có được lượng hóa với kích thước/vị trí cụ thể không?" [Độ rõ ràng]
   - "Yêu cầu về trạng thái hover có nhất quán trên tất cả các phần tử tương tác không?" [Tính nhất quán]
   - "Yêu cầu về điều hướng bàn phím có được định nghĩa cho UI tương tác không?" [Độ phủ]
   - "Hành vi dự phòng có được chỉ định khi logo tải thất bại không?" [Trường hợp ngoại lệ]
   - "Trạng thái loading có được định nghĩa cho dữ liệu tập phim bất đồng bộ không?" [Độ đầy đủ]
   - "Spec có định nghĩa phân cấp thị giác cho các phần tử UI cạnh tranh không?" [Độ rõ ràng]

   **CẤU TRÚC MỤC**:
   Mỗi mục nên theo mẫu này:
   - Định dạng câu hỏi hỏi về chất lượng yêu cầu
   - Tập trung vào những gì ĐƯỢC VIẾT (hoặc không được viết) trong spec/plan
   - Bao gồm chiều chất lượng trong ngoặc vuông [Độ đầy đủ/Độ rõ ràng/Tính nhất quán/v.v.]
   - Tham chiếu phần spec `[Spec §X.Y]` khi kiểm tra yêu cầu hiện có
   - Sử dụng đánh dấu `[Gap]` khi kiểm tra yêu cầu còn thiếu

   **VÍ DỤ THEO CHIỀU CHẤT LƯỢNG**:

   Độ đầy đủ:
   - "Yêu cầu xử lý lỗi có được định nghĩa cho tất cả các chế độ thất bại API không? [Gap]"
   - "Yêu cầu khả năng truy cập có được chỉ định cho tất cả các phần tử tương tác không? [Độ đầy đủ]"
   - "Yêu cầu breakpoint mobile có được định nghĩa cho bố cục responsive không? [Gap]"

   Độ rõ ràng:
   - "'Tải nhanh' có được lượng hóa với ngưỡng thời gian cụ thể không? [Độ rõ ràng, Spec §NFR-2]"
   - "Tiêu chí chọn 'tập liên quan' có được định nghĩa rõ không? [Độ rõ ràng, Spec §FR-5]"
   - "'Nổi bật' có được định nghĩa với thuộc tính thị giác đo được không? [Sự mơ hồ, Spec §FR-4]"

   Tính nhất quán:
   - "Yêu cầu điều hướng có phù hợp trên tất cả các trang không? [Tính nhất quán, Spec §FR-10]"
   - "Yêu cầu thành phần thẻ có nhất quán giữa trang landing và trang chi tiết không? [Tính nhất quán]"

   Độ phủ:
   - "Yêu cầu có được định nghĩa cho các kịch bản zero-state (không tập phim) không? [Độ phủ, Trường hợp ngoại lệ]"
   - "Các kịch bản tương tác người dùng đồng thời có được giải quyết không? [Độ phủ, Gap]"
   - "Yêu cầu có được chỉ định cho các lỗi tải dữ liệu một phần không? [Độ phủ, Luồng ngoại lệ]"

   Khả năng đo lường:
   - "Yêu cầu phân cấp thị giác có đo được/kiểm thử được không? [Tiêu chí chấp nhận, Spec §FR-1]"
   - "'Trọng số thị giác cân bằng' có thể được xác minh khách quan không? [Khả năng đo lường, Spec §FR-2]"

   **Phân loại & Độ phủ Kịch bản** (Trọng tâm Chất lượng Yêu cầu):
   - Kiểm tra xem yêu cầu có tồn tại cho: Kịch bản Chính, Thay thế, Ngoại lệ/Lỗi, Khôi phục, Phi chức năng
   - Với mỗi lớp kịch bản, hỏi: "Yêu cầu [loại kịch bản] có đầy đủ, rõ ràng và nhất quán không?"
   - Nếu lớp kịch bản còn thiếu: "Yêu cầu [loại kịch bản] có bị loại trừ có chủ đích hay còn thiếu không? [Gap]"
   - Bao gồm resilience/rollback khi thay đổi trạng thái: "Yêu cầu rollback có được định nghĩa cho các lỗi migration không? [Gap]"

   **Yêu cầu Khả năng Truy vết**:
   - TỐI THIỂU: ≥80% mục PHẢI bao gồm ít nhất một tham chiếu truy vết
   - Mỗi mục nên tham chiếu: phần spec `[Spec §X.Y]`, hoặc dùng đánh dấu: `[Gap]`, `[Ambiguity]`, `[Conflict]`, `[Assumption]`
   - Nếu không có hệ thống ID: "Hệ thống ID yêu cầu & tiêu chí chấp nhận có được thiết lập không? [Khả năng truy vết]"

   **Phát hiện & Giải quyết Vấn đề** (Vấn đề Chất lượng Yêu cầu):
   Đặt câu hỏi về chính các yêu cầu:
   - Sự mơ hồ: "Thuật ngữ 'nhanh' có được lượng hóa với số liệu cụ thể không? [Sự mơ hồ, Spec §NFR-1]"
   - Xung đột: "Yêu cầu điều hướng có xung đột giữa §FR-10 và §FR-10a không? [Xung đột]"
   - Giả định: "Giả định 'podcast API luôn khả dụng' có được xác thực không? [Giả định]"
   - Phụ thuộc: "Yêu cầu podcast API bên ngoài có được ghi lại không? [Phụ thuộc, Gap]"
   - Định nghĩa còn thiếu: "'Phân cấp thị giác' có được định nghĩa với tiêu chí đo được không? [Gap]"

   **Gộp Nội dung**:
   - Giới hạn mềm: Nếu mục ứng viên thô > 40, ưu tiên theo rủi ro/tác động
   - Gộp các mục gần trùng lặp kiểm tra cùng khía cạnh yêu cầu
   - Nếu >5 trường hợp ngoại lệ tác động thấp, tạo một mục: "Các trường hợp ngoại lệ X, Y, Z có được giải quyết trong yêu cầu không? [Độ phủ]"

   **🚫 TUYỆT ĐỐI BỊ CẤM** - Những điều này làm nó thành bài kiểm thử implementation, không phải bài kiểm thử yêu cầu:
   - ❌ Bất kỳ mục nào bắt đầu bằng "Xác minh", "Kiểm thử", "Xác nhận", "Kiểm tra" + hành vi implementation
   - ❌ Tham chiếu đến thực thi code, hành động người dùng, hành vi hệ thống
   - ❌ "Hiển thị đúng", "hoạt động đúng", "hoạt động như mong đợi"
   - ❌ "Click", "điều hướng", "render", "tải", "thực thi"
   - ❌ Test case, kế hoạch test, quy trình QA
   - ❌ Chi tiết implementation (frameworks, APIs, algorithms)

   **✅ MẪU BẮT BUỘC** - Những điều này kiểm tra chất lượng yêu cầu:
   - ✅ "[Loại yêu cầu] có được định nghĩa/chỉ định/ghi lại cho [kịch bản] không?"
   - ✅ "[Thuật ngữ mơ hồ] có được lượng hóa/làm rõ với tiêu chí cụ thể không?"
   - ✅ "Yêu cầu có nhất quán giữa [phần A] và [phần B] không?"
   - ✅ "[Yêu cầu] có thể được đo lường/xác minh khách quan không?"
   - ✅ "[Trường hợp ngoại lệ/kịch bản] có được giải quyết trong yêu cầu không?"
   - ✅ "Spec có định nghĩa [khía cạnh còn thiếu] không?"

6. **Cấu trúc Tham chiếu**: Tạo checklist theo mẫu canonical trong `.specify/templates/checklist-template.md` cho tiêu đề, phần meta, tiêu đề danh mục, và định dạng ID. Nếu mẫu không khả dụng, dùng: tiêu đề H1, các dòng meta mục đích/được tạo, các phần danh mục `##` chứa các dòng `- [ ] CHK### <mục yêu cầu>` với ID tăng toàn cục bắt đầu từ CHK001.

7. **Báo cáo**: Xuất ra đường dẫn đầy đủ đến checklist đã tạo, số lượng mục, và nhắc người dùng rằng mỗi lần chạy tạo một file mới. Tóm tắt:
   - Các khu vực trọng tâm được chọn
   - Mức độ sâu
   - Actor/thời điểm
   - Bất kỳ mục phải có nào được người dùng chỉ định rõ đã được kết hợp

**Quan trọng**: Mỗi lần gọi lệnh `/speckit.checklist` tạo một file checklist dùng tên ngắn, mô tả trừ khi file đã tồn tại. Điều này cho phép:

- Nhiều checklist khác loại (ví dụ: `ux.md`, `test.md`, `security.md`)
- Tên file đơn giản, dễ nhớ chỉ ra mục đích checklist
- Dễ dàng xác định và điều hướng trong thư mục `checklists/`

Để tránh lộn xộn, dùng loại mô tả và dọn dẹp checklist lỗi thời khi hoàn thành.

## Ví dụ Kiểu Checklist & Mục Mẫu

**Chất lượng Yêu cầu UX:** `ux.md`

Mục mẫu (kiểm thử yêu cầu, KHÔNG phải implementation):

- "Yêu cầu phân cấp thị giác có được định nghĩa với tiêu chí đo được không? [Độ rõ ràng, Spec §FR-1]"
- "Số lượng và vị trí của các phần tử UI có được chỉ định rõ không? [Độ đầy đủ, Spec §FR-1]"
- "Yêu cầu trạng thái tương tác (hover, focus, active) có được định nghĩa nhất quán không? [Tính nhất quán]"
- "Yêu cầu khả năng truy cập có được chỉ định cho tất cả các phần tử tương tác không? [Độ phủ, Gap]"
- "Hành vi dự phòng có được định nghĩa khi hình ảnh tải thất bại không? [Trường hợp ngoại lệ, Gap]"
- "'Hiển thị nổi bật' có thể được đo lường khách quan không? [Khả năng đo lường, Spec §FR-4]"

**Chất lượng Yêu cầu API:** `api.md`

Mục mẫu:

- "Định dạng phản hồi lỗi có được chỉ định cho tất cả các kịch bản thất bại không? [Độ đầy đủ]"
- "Yêu cầu rate limiting có được lượng hóa với ngưỡng cụ thể không? [Độ rõ ràng]"
- "Yêu cầu xác thực có nhất quán trên tất cả các endpoint không? [Tính nhất quán]"
- "Yêu cầu retry/timeout có được định nghĩa cho các dependencies bên ngoài không? [Độ phủ, Gap]"
- "Chiến lược versioning có được ghi lại trong yêu cầu không? [Gap]"

**Chất lượng Yêu cầu Hiệu suất:** `performance.md`

Mục mẫu:

- "Yêu cầu hiệu suất có được lượng hóa với số liệu cụ thể không? [Độ rõ ràng]"
- "Mục tiêu hiệu suất có được định nghĩa cho tất cả các hành trình người dùng quan trọng không? [Độ phủ]"
- "Yêu cầu hiệu suất dưới các điều kiện tải khác nhau có được chỉ định không? [Độ đầy đủ]"
- "Yêu cầu hiệu suất có thể được đo lường khách quan không? [Khả năng đo lường]"
- "Yêu cầu degradation có được định nghĩa cho các kịch bản tải cao không? [Trường hợp ngoại lệ, Gap]"

**Chất lượng Yêu cầu Bảo mật:** `security.md`

Mục mẫu:

- "Yêu cầu xác thực có được chỉ định cho tất cả các tài nguyên được bảo vệ không? [Độ phủ]"
- "Yêu cầu bảo vệ dữ liệu có được định nghĩa cho thông tin nhạy cảm không? [Độ đầy đủ]"
- "Mô hình đe dọa có được ghi lại và yêu cầu phù hợp với nó không? [Khả năng truy vết]"
- "Yêu cầu bảo mật có nhất quán với nghĩa vụ tuân thủ không? [Tính nhất quán]"
- "Yêu cầu phản hồi failure/breach bảo mật có được định nghĩa không? [Gap, Luồng ngoại lệ]"

## Anti-Ví dụ: Những Điều KHÔNG Nên Làm

**❌ SAI - Những điều này kiểm thử implementation, không phải yêu cầu:**

```markdown
- [ ] CHK001 - Xác minh trang landing hiển thị 3 thẻ tập phim [Spec §FR-001]
- [ ] CHK002 - Kiểm thử trạng thái hover hoạt động đúng trên desktop [Spec §FR-003]
- [ ] CHK003 - Xác nhận click logo chuyển đến trang chủ [Spec §FR-010]
- [ ] CHK004 - Kiểm tra phần tập liên quan hiển thị 3-5 mục [Spec §FR-005]
```

**✅ ĐÚNG - Những điều này kiểm thử chất lượng yêu cầu:**

```markdown
- [ ] CHK001 - Số lượng và bố cục của các tập nổi bật có được chỉ định rõ không? [Độ đầy đủ, Spec §FR-001]
- [ ] CHK002 - Yêu cầu trạng thái hover có được định nghĩa nhất quán cho tất cả các phần tử tương tác không? [Tính nhất quán, Spec §FR-003]
- [ ] CHK003 - Yêu cầu điều hướng có rõ cho tất cả các phần tử thương hiệu có thể click không? [Độ rõ ràng, Spec §FR-010]
- [ ] CHK004 - Tiêu chí chọn tập liên quan có được ghi lại không? [Gap, Spec §FR-005]
- [ ] CHK005 - Yêu cầu trạng thái loading có được định nghĩa cho dữ liệu tập phim bất đồng bộ không? [Gap]
- [ ] CHK006 - Yêu cầu "phân cấp thị giác" có thể được đo lường khách quan không? [Khả năng đo lường, Spec §FR-001]
```

**Sự Khác Biệt Chính:**

- Sai: Kiểm thử xem hệ thống hoạt động đúng
- Đúng: Kiểm thử xem yêu cầu được viết đúng
- Sai: Xác minh hành vi
- Đúng: Xác thực chất lượng yêu cầu
- Sai: "Nó có làm X không?"
- Đúng: "X có được chỉ định rõ không?"
