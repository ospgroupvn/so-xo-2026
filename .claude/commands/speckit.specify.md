---
description: Tạo hoặc cập nhật đặc tả tính năng từ mô tả tính năng bằng ngôn ngữ tự nhiên.
handoffs:
  - label: Xây dựng Kế hoạch Kỹ thuật
    agent: speckit.plan
    prompt: Tạo kế hoạch cho đặc tả. Tôi đang xây dựng với...
  - label: Làm rõ Yêu cầu Đặc tả
    agent: speckit.clarify
    prompt: Làm rõ các yêu cầu đặc tả
    send: true
---

## Đầu vào của Người dùng

```text
$ARGUMENTS
```

Bạn **BẮT BUỘC** phải xem xét đầu vào của người dùng trước khi tiếp tục (nếu không trống).

## Phác thảo

Nội dung người dùng nhập sau `/speckit.specify` trong tin nhắn kích hoạt **chính là** mô tả tính năng. Giả sử rằng bạn luôn có nội dung này sẵn có trong cuộc hội thoại, ngay cả khi `$ARGUMENTS` xuất hiện theo nghĩa đen dưới đây. Đừng yêu cầu người dùng lặp lại lại, trừ khi họ cung cấp một lệnh trống.

Với mô tả tính năng đó, hãy thực hiện các việc sau:

1. **Tạo tên ngắn gọn** (2-4 từ) cho nhánh:
   - Phân tích mô tả tính năng và trích xuất các từ khóa có ý nghĩa nhất
   - Tạo tên ngắn 2-4 từ nắm bắt bản chất của tính năng
   - Sử dụng định dạng động từ-danh từ khi có thể (ví dụ: "add-user-auth", "fix-payment-bug")
   - Giữ nguyên các thuật ngữ kỹ thuật và viết tắt (OAuth2, API, JWT, v.v.)
   - Giữ nó ngắn gọn nhưng đủ mô tả để hiểu tính năng ngay lập tức
   - Ví dụ:
     - "Tôi muốn thêm xác thực người dùng" → "user-auth"
     - "Tích hợp OAuth2 cho API" → "oauth2-api-integration"
     - "Tạo dashboard phân tích" → "analytics-dashboard"
     - "Sửa lỗi timeout xử lý thanh toán" → "fix-payment-timeout"

2. **Kiểm tra các nhánh tồn tại trước khi tạo nhánh mới**:

   a. Đầu tiên, fetch tất cả nhánh từ xa để đảm bảo chúng ta có thông tin mới nhất:

      ```bash
      git fetch --all --prune
      ```

   b. Tìm số tính năng cao nhất trên tất cả các nguồn cho tên-ngắn:
      - Nhánh từ xa: `git ls-remote --heads origin | grep -E 'refs/heads/[0-9]+-<ten-ngan>$'`
      - Nhánh local: `git branch | grep -E '^[* ]*[0-9]+-<ten-ngan>$'`
      - Thư mục specs: Kiểm tra các thư mục khớp với `specs/[0-9]+-<ten-ngan>`

   c. Xác định số tiếp theo có sẵn:
      - Trích xuất tất cả các số từ cả ba nguồn
      - Tìm số cao nhất N
      - Sử dụng N+1 cho số nhánh mới

   d. Chạy script `.specify/scripts/bash/create-new-feature.sh --json "$ARGUMENTS"` với số và tên-ngắn đã tính toán:
      - Truyền `--number N+1` và `--short-name "ten-ngan-cua-ban"` cùng với mô tả tính năng
      - Ví dụ Bash: `.specify/scripts/bash/create-new-feature.sh --json "$ARGUMENTS" --json --number 5 --short-name "user-auth" "Thêm xác thực người dùng"`
      - Ví dụ PowerShell: `.specify/scripts/bash/create-new-feature.sh --json "$ARGUMENTS" -Json -Number 5 -ShortName "user-auth" "Thêm xác thực người dùng"`

   **QUAN TRỌNG**:
   - Kiểm tra cả ba nguồn (nhánh từ xa, nhánh local, thư mục specs) để tìm số cao nhất
   - Chỉ khớp các nhánh/thư mục với mẫu tên-ngắn chính xác
   - Nếu không tìm thấy nhánh/thư mục nào tồn tại với tên-ngắn này, bắt đầu từ số 1
   - Bạn chỉ được chạy script này một lần cho mỗi tính năng
   - JSON được cung cấp trong terminal dưới dạng đầu ra - luôn tham chiếu nó để lấy nội dung thực tế bạn cần
   - Đầu ra JSON sẽ chứa đường dẫn BRANCH_NAME và SPEC_FILE
   - Đối với dấu nháy đơn trong tham số như "I'm Groot", sử dụng cú pháp escape: ví dụ 'I'\''m Groot' (hoặc dùng dấu nháy kép nếu có thể: "I'm Groot")

3. Tải `.specify/templates/spec-template.md` để hiểu các phần bắt buộc.

4. Thực hiện theo quy trình thực thi này:

    1. Phân tích mô tả người dùng từ Đầu vào
       Nếu trống: LỖI "Không có mô tả tính năng nào được cung cấp"
    2. Trích xuất các khái niệm chính từ mô tả
       Xác định: người dùng, hành động, dữ liệu, ràng buộc
    3. Đối với các khía cạnh không rõ ràng:
       - Đưa ra các giả định có căn cứ dựa trên ngữ cảnh và tiêu chuẩn ngành
       - Chỉ đánh dấu bằng [CẦN LÀM RÕ: câu hỏi cụ thể] nếu:
         - Lựa chọn ảnh hưởng đáng kể đến phạm vi tính năng hoặc trải nghiệm người dùng
         - Có nhiều cách diễn giải hợp lý với các tác động khác nhau
         - Không có mặc định hợp lý nào tồn tại
       - **GIỚI HẠN**: Tối đa 3 đánh dấu [CẦN LÀM Rổ] tổng cộng
       - Ưu tiên các vấn đề cần làm rõ theo tác động: phạm vi > bảo mật/quyền riêng tư > trải nghiệm người dùng > chi tiết kỹ thuật
    4. Điền phần Kịch bản Người dùng & Kiểm thử
       Nếu không có luồng người dùng rõ ràng: LỖI "Không thể xác định kịch bản người dùng"
    5. Tạo Yêu cầu Chức năng
       Mỗi yêu cầu phải có thể kiểm thử được
       Sử dụng các mặc định hợp lý cho các chi tiết chưa được chỉ định (tài liệu hóa các giả định trong phần Giả định)
    6. Xác định Tiêu chí Thành công
       Tạo các kết quả có thể đo lường, không phụ thuộc vào công nghệ
       Bao gồm cả chỉ số định lượng (thời gian, hiệu suất, khối lượng) và đo lường định tính (sự hài lòng của người dùng, hoàn thành nhiệm vụ)
       Mỗi tiêu chí phải có thể xác minh mà không cần chi tiết triển khai
    7. Xác định Các Thực thể Chính (nếu có liên quan đến dữ liệu)
    8. Trả về: THÀNH CÔNG (đặc tả sẵn sàng để lập kế hoạch)

5. Viết đặc tả vào SPEC_FILE sử dụng cấu trúc mẫu, thay thế các placeholder bằng chi tiết cụ thể được derive từ mô tả tính năng (tham số) trong khi vẫn giữ nguyên thứ tự phần và tiêu đề.

6. **Xác thực Chất lượng Đặc tả**: Sau khi viết đặc tả ban đầu, xác thực nó theo các tiêu chí chất lượng:

   a. **Tạo Checklist Chất lượng Đặc tả**: Tạo file checklist tại `FEATURE_DIR/checklists/requirements.md` sử dụng cấu trúc mẫu checklist với các mục xác thực này:

      ```markdown
      # Checklist Chất lượng Đặc tả: [TÊN TÍNH NĂNG]

      **Mục đích**: Xác thực tính đầy đủ và chất lượng của đặc tả trước khi tiến hành lập kế hoạch
      **Được tạo**: [NGÀY]
      **Tính năng**: [Liên kết đến spec.md]

      ## Chất lượng Nội dung

      - [ ] Không có chi tiết triển khai (ngôn ngữ, framework, API)
      - [ ] Tập trung vào giá trị người dùng và nhu cầu kinh doanh
      - [ ] Viết cho các bên liên quan không kỹ thuật
      - [ ] Tất cả các phần bắt buộc đã hoàn thành

      ## Tính Đầy đủ của Yêu cầu

      - [ ] Không còn đánh dấu [CẦN LÀM Rổ]
      - [ ] Yêu cầu có thể kiểm thử và không mơ hồ
      - [ ] Tiêu chí thành công có thể đo lường được
      - [ ] Tiêu chí thành công không phụ thuộc vào công nghệ (không có chi tiết triển khai)
      - [ ] Tất cả kịch bản chấp nhận đều được xác định
      - [ ] Các trường hợp ngoại lệ đã được xác định
      - [ ] Phạm vi được giới hạn rõ ràng
      - [ ] Các phụ thuộc và giả định đã được xác định

      ## Sẵn sàng của Tính năng

      - [ ] Tất cả yêu cầu chức năng đều có tiêu chí chấp nhận rõ ràng
      - [ ] Kịch bản người dùng bao phủ các luồng chính
      - [ ] Tính năng đáp ứng các kết quả có thể đo lường được trong Tiêu chí Thành công
      - [ ] Không có chi tiết triển khai nào lọt vào đặc tả

      ## Ghi chú

      - Các mục được đánh dấu chưa hoàn thành yêu cầu cập nhật đặc tả trước khi `/speckit.clarify` hoặc `/speckit.plan`
      ```

   b. **Chạy Kiểm tra Xác thực**: Xem lại đặc tả theo từng mục checklist:
      - Đối với mỗi mục, xác định xem nó đạt hay không
      - Tài liệu hóa các vấn đề cụ thể được tìm thấy (trích dẫn các phần đặc tả liên quan)

   c. **Xử lý Kết quả Xác thực**:

      - **Nếu tất cả mục đều đạt**: Đánh dấu checklist hoàn thành và tiếp tục sang bước 6

      - **Nếu các mục không đạt (loại trừ [CẦN LÀM Rổ])**:
        1. Liệt kê các mục không đạt và các vấn đề cụ thể
        2. Cập nhật đặc tả để giải quyết từng vấn đề
        3. Chạy lại xác thực cho đến khi tất cả mục đều đạt (tối đa 3 lần lặp)
        4. Nếu vẫn không đạt sau 3 lần lặp, tài liệu hóa các vấn đề còn lại trong ghi chú checklist và cảnh báo người dùng

      - **Nếu đánh dấu [CẦN LÀM Rổ] còn lại**:
        1. Trích xuất tất cả đánh dấu [CẦN LÀM Rổ: ...] từ đặc tả
        2. **KIỂM TRA GIỚI HẠN**: Nếu có nhiều hơn 3 đánh dấu, chỉ giữ lại 3 đánh dấu quan trọng nhất (theo tác động phạm vi/bảo mật/UX) và đưa ra giả định có căn cứ cho phần còn lại
        3. Đối với mỗi vấn đề cần làm rõ (tối đa 3), trình bày các tùy chọn cho người dùng theo định dạng này:

           ```markdown
           ## Câu hỏi [N]: [Chủ đề]

           **Ngữ cảnh**: [Trích dẫn phần đặc tả liên quan]

           **Chúng tôi cần biết**: [Câu hỏi cụ thể từ đánh dấu CẦN LÀM Rổ]

           **Câu trả lời Đề xuất**:

           | Tùy chọn | Câu trả lời | Tác động |
           |----------|-------------|----------|
           | A      | [Câu trả lời đề xuất đầu tiên] | [Điều này có nghĩa gì cho tính năng] |
           | B      | [Câu trả lời đề xuất thứ hai] | [Điều này có nghĩa gì cho tính năng] |
           | C      | [Câu trả lời đề xuất thứ ba] | [Điều này có nghĩa gì cho tính năng] |
           | Tùy chỉnh | Cung cấp câu trả lời của bạn | [Giải thích cách cung cấp đầu vào tùy chỉnh] |

           **Lựa chọn của bạn**: _[Chờ người dùng phản hồi]_
           ```

        4. **QUAN TRỌNG - Định dạng Bảng**: Đảm bảo các bảng markdown được định dạng chính xác:
           - Sử dụng khoảng trắng nhất quán với các đường kẹp thẳng được căn chỉnh
           - Mỗi ô phải có khoảng trắng xung quanh nội dung: `| Nội dung |` chứ không phải `|Nội dung|`
           - Dấu phân cách tiêu đề phải có ít nhất 3 dấu gạch ngang: `|--------|`
           - Kiểm tra xem bảng có hiển thị chính xác trong xem trước markdown không
        5. Đánh số câu hỏi tuần tự (Q1, Q2, Q3 - tối đa 3 tổng cộng)
        6. Trình bày tất cả câu hỏi cùng nhau trước khi chờ phản hồi
        7. Chờ người dùng phản hồi với lựa chọn của họ cho tất cả câu hỏi (ví dụ: "Q1: A, Q2: Tùy chỉnh - [chi tiết], Q3: B")
        8. Cập nhật đặc tả bằng cách thay thế mỗi đánh dấu [CẦN LÀM RỖ] bằng câu trả lời được chọn hoặc cung cấp của người dùng
        9. Chạy lại xác thực sau khi tất cả các vấn đề được làm rõ đã được giải quyết

   d. **Cập nhật Checklist**: Sau mỗi lần lặp xác thực, cập nhật file checklist với trạng thái đạt/không đạt hiện tại

7. Báo cáo hoàn thành với tên nhánh, đường dẫn file đặc tả, kết quả checklist và sự sẵn sàng cho giai đoạn tiếp theo (`/speckit.clarify` hoặc `/speckit.plan`).

**LƯU Ý:** Script sẽ tạo và checkout nhánh mới và khởi tạo file đặc tả trước khi viết.

## Hướng dẫn Chung

## Hướng dẫn Nhanh

- Tập trung vào **CÁI GÌ** người dùng cần và **TẠI SAO**.
- Tránh CÁCH NÀO để triển khai (không có stack công nghệ, API, cấu trúc code).
- Viết cho các bên liên quan kinh doanh, không phải cho nhà phát triển.
- KHÔNG tạo bất kỳ checklist nào được nhúng trong đặc tả. Điều đó sẽ là một lệnh riêng.

### Yêu cầu Phần

- **Phần bắt buộc**: Phải hoàn thành cho mọi tính năng
- **Phần tùy chọn**: Chỉ bao gồm khi liên quan đến tính năng
- Khi một phần không áp dụng, xóa nó hoàn toàn (đừng để là "N/A")

### Để AI Tạo ra

Khi tạo đặc tả này từ một lời nhắc của người dùng:

1. **Đưa ra các giả định có căn cứ**: Sử dụng ngữ cảnh, tiêu chuẩn ngành và các mẫu phổ biến để điền vào các khoảng trống
2. **Tài liệu hóa các giả định**: Ghi lại các mặc định hợp lý trong phần Giả định
3. **Giới hạn các vấn đề cần làm rõ**: Tối đa 3 đánh dấu [CẦN LÀM Rổ] - chỉ sử dụng cho các quyết định quan trọng mà:
   - Ảnh hưởng đáng kể đến phạm vi tính năng hoặc trải nghiệm người dùng
   - Có nhiều cách diễn giải hợp lý với các tác động khác nhau
   - Thiếu bất kỳ mặc định hợp lý nào
4. **Ưu tiên các vấn đề cần làm rõ**: phạm vi > bảo mật/quyền riêng tư > trải nghiệm người dùng > chi tiết kỹ thuật
5. **Nghĩ như một người kiểm thử**: Mọi yêu cầu mơ hồ đều không đạt mục "có thể kiểm thử và không mơ hồ" trong checklist
6. **Các lĩnh vực thường cần làm rõ** (chỉ khi không có mặc định hợp lý nào tồn tại):
   - Phạm vi và ranh giới tính năng (bao gồm/loại bỏ các trường hợp sử dụng cụ thể)
   - Loại người dùng và quyền (nếu có nhiều cách diễn hiểu mâu thuẫn)
   - Yêu cầu bảo mật/tuân thủ (khi có ý nghĩa về mặt pháp lý/tài chính)

**Ví dụ về các mặc định hợp lý** (đừng hỏi về những thứ này):

- Lưu trữ dữ liệu: Các thực hành tiêu chuẩn ngành cho lĩnh vực đó
- Mục tiêu hiệu suất: Kỳ vọng tiêu chuẩn ứng dụng web/di động trừ khi được chỉ định
- Xử lý lỗi: Thông báo thân thiện với người dùng với các phương án dự phòng phù hợp
- Phương thức xác thực: Phiên tiêu chuẩn hoặc OAuth2 cho ứng dụng web
- Mẫu tích hợp: Sử dụng các mẫu phù hợp với dự án (REST/GraphQL cho dịch vụ web, lời gọi hàm cho thư viện, tham số CLI cho công cụ, v.v.)

### Hướng dẫn Tiêu chí Thành công

Tiêu chí thành công phải là:

1. **Có thể đo lường**: Bao gồm các chỉ số cụ thể (thời gian, phần trăm, số lượng, tỷ lệ)
2. **Không phụ thuộc vào công nghệ**: Không đề cập đến framework, ngôn ngữ, cơ sở dữ liệu hoặc công cụ
3. **Tập trung vào người dùng**: Mô tả kết quả từ góc độ người dùng/kinh doanh, không phải nội bộ hệ thống
4. **Có thể xác minh**: Có thể kiểm thử/xác thực mà không cần biết chi tiết triển khai

**Ví dụ tốt**:

- "Người dùng có thể hoàn thành thanh toán trong vòng 3 phút"
- "Hệ thống hỗ trợ 10.000 người dùng đồng thời"
- "95% tìm kiếm trả về kết quả trong vòng 1 giây"
- "Tỷ lệ hoàn thành nhiệm vụ tăng 40%"

**Ví dụ xấu** (tập trung vào triển khai):

- "Thời gian phản hồi API dưới 200ms" (quá kỹ thuật, sử dụng "Người dùng thấy kết quả ngay lập tức")
- "Cơ sở dữ liệu có thể xử lý 1000 TPS" (chi tiết triển khai, sử dụng chỉ số hướng tới người dùng)
- "React component hiển thị hiệu quả" (cụ thể cho framework)
- "Tỷ lệ cache Redis trên 80%" (cụ thể cho công nghệ)
