---
description: Thực thi kế hoạch triển khai bằng cách xử lý và thực thi tất cả các task được định nghĩa trong tasks.md
---

## Đầu vào của người dùng

```text
$ARGUMENTS
```

Bạn **BẮT BUỘC** phải xem xét đầu vào của người dùng trước khi tiếp tục (nếu không rỗng).

## Tóm tắt quy trình

1. Chạy lệnh `.specify/scripts/bash/check-prerequisites.sh --json --require-tasks --include-tasks` từ thư mục gốc của repo và phân tích FEATURE_DIR cùng danh sách AVAILABLE_DOCS. Tất cả đường dẫn phải là đường dẫn tuyệt đối. Đối với dấu nháy đơn trong tham số như "I'm Groot", hãy sử dụng cú pháp escape: ví dụ 'I'\''m Groot' (hoặc dùng dấu nháy kép nếu có thể: "I'm Groot").

2. **Kiểm tra trạng thái checklist** (nếu FEATURE_DIR/checklists/ tồn tại):
   - Quét tất cả các file checklist trong thư mục checklists/
   - Đối với mỗi checklist, đếm:
     - Tổng số mục: Tất cả dòng khớp với `- [ ]` hoặc `- [X]` hoặc `- [x]`
     - Mục đã hoàn thành: Dòng khớp với `- [X]` hoặc `- [x]`
     - Mục chưa hoàn thành: Dòng khớp với `- [ ]`
   - Tạo bảng trạng thái:

     ```text
     | Checklist | Tổng | Đã hoàn thành | Chưa hoàn thành | Trạng thái |
     |-----------|-------|---------------|-----------------|------------|
     | ux.md     | 12    | 12            | 0               | ✓ ĐẠT      |
     | test.md   | 8     | 5             | 3               | ✗ KHÔNG ĐẠT |
     | security.md | 6   | 6             | 0               | ✓ ĐẠT      |
     ```

   - Tính toán trạng thái tổng thể:
     - **ĐẠT (PASS)**: Tất cả checklist có 0 mục chưa hoàn thành
     - **KHÔNG ĐẠT (FAIL)**: Một hoặc nhiều checklist có mục chưa hoàn thành

   - **Nếu bất kỳ checklist nào chưa hoàn thành**:
     - Hiển thị bảng với số lượng mục chưa hoàn thành
     - **DỪNG LẠI** và hỏi: "Một số checklist chưa hoàn thành. Bạn có muốn tiếp tục triển khai anyway? (yes/no)"
     - Chờ phản hồi từ người dùng trước khi tiếp tục
     - Nếu người dùng nói "no" hoặc "wait" hoặc "stop", dừng thực thi
     - Nếu người dùng nói "yes" hoặc "proceed" hoặc "continue", tiếp tục đến bước 3

   - **Nếu tất cả checklist đã hoàn thành**:
     - Hiển thị bảng cho thấy tất cả checklist đã đạt
     - Tự động tiếp tục đến bước 3

3. Tải và phân tích ngữ cảnh triển khai:
   - **BẮT BUỘC**: Đọc tasks.md để lấy danh sách task hoàn chỉnh và kế hoạch thực thi
   - **BẮT BUỘC**: Đọc plan.md để hiểu tech stack, kiến trúc và cấu trúc file
   - **NẾU TỒN TẠI**: Đọc data-model.md để hiểu các thực thể và mối quan hệ
   - **NẾU TỒN TẠI**: Đọc contracts/ để hiểu các đặc tả API và yêu cầu kiểm thử
   - **NẾU TỒN TẠI**: Đọc research.md để hiểu các quyết định kỹ thuật và ràng buộc
   - **NẾU TỒN TẠI**: Đọc quickstart.md để hiểu các kịch bản tích hợp

4. **Xác thực thiết lập dự án**:
   - **BẮT BUỘC**: Tạo/xác minh các file ignore dựa trên thiết lập thực tế của dự án:

   **Logic phát hiện & tạo**:
   - Kiểm tra xem lệnh sau có thành công hay không để xác định repository có phải là git repo hay không (tạo/xác minh .gitignore nếu đúng):

     ```sh
     git rev-parse --git-dir 2>/dev/null
     ```

   - Kiểm tra Dockerfile* có tồn tại hoặc Docker có trong plan.md → tạo/xác minh .dockerignore
   - Kiểm tra .eslintrc* có tồn tại → tạo/xác minh .eslintignore
   - Kiểm tra eslint.config.* có tồn tại → đảm bảo các mục `ignores` trong config bao phủ các pattern cần thiết
   - Kiểm tra .prettierrc* có tồn tại → tạo/xác minh .prettierignore
   - Kiểm tra .npmrc hoặc package.json có tồn tại → tạo/xác minh .npmignore (nếu đang publish)
   - Kiểm tra file terraform (*.tf) có tồn tại → tạo/xác minh .terraformignore
   - Kiểm tra .helmignore có cần thiết hay không (có helm charts) → tạo/xác minh .helmignore

   **Nếu file ignore đã tồn tại**: Xác minh nó chứa các pattern cần thiết, chỉ thêm các pattern quan trọng bị thiếu
   **Nếu file ignore bị thiếu**: Tạo với bộ pattern đầy đủ cho công nghệ đã phát hiện

   **Các pattern phổ biến theo công nghệ** (từ tech stack trong plan.md):
   - **Node.js/JavaScript/TypeScript**: `node_modules/`, `dist/`, `build/`, `*.log`, `.env*`
   - **Python**: `__pycache__/`, `*.pyc`, `.venv/`, `venv/`, `dist/`, `*.egg-info/`
   - **Java**: `target/`, `*.class`, `*.jar`, `.gradle/`, `build/`
   - **C#/.NET**: `bin/`, `obj/`, `*.user`, `*.suo`, `packages/`
   - **Go**: `*.exe`, `*.test`, `vendor/`, `*.out`
   - **Ruby**: `.bundle/`, `log/`, `tmp/`, `*.gem`, `vendor/bundle/`
   - **PHP**: `vendor/`, `*.log`, `*.cache`, `*.env`
   - **Rust**: `target/`, `debug/`, `release/`, `*.rs.bk`, `*.rlib`, `*.prof*`, `.idea/`, `*.log`, `.env*`
   - **Kotlin**: `build/`, `out/`, `.gradle/`, `.idea/`, `*.class`, `*.jar`, `*.iml`, `*.log`, `.env*`
   - **C++**: `build/`, `bin/`, `obj/`, `out/`, `*.o`, `*.so`, `*.a`, `*.exe`, `*.dll`, `.idea/`, `*.log`, `.env*`
   - **C**: `build/`, `bin/`, `obj/`, `out/`, `*.o`, `*.a`, `*.so`, `*.exe`, `Makefile`, `config.log`, `.idea/`, `*.log`, `.env*`
   - **Swift**: `.build/`, `DerivedData/`, `*.swiftpm/`, `Packages/`
   - **R**: `.Rproj.user/`, `.Rhistory`, `.RData`, `.Ruserdata`, `*.Rproj`, `packrat/`, `renv/`
   - **Phổ quát (Universal)**: `.DS_Store`, `Thumbs.db`, `*.tmp`, `*.swp`, `.vscode/`, `.idea/`

   **Pattern cụ thể theo công cụ**:
   - **Docker**: `node_modules/`, `.git/`, `Dockerfile*`, `.dockerignore`, `*.log*`, `.env*`, `coverage/`
   - **ESLint**: `node_modules/`, `dist/`, `build/`, `coverage/`, `*.min.js`
   - **Prettier**: `node_modules/`, `dist/`, `build/`, `coverage/`, `package-lock.json`, `yarn.lock`, `pnpm-lock.yaml`
   - **Terraform**: `.terraform/`, `*.tfstate*`, `*.tfvars`, `.terraform.lock.hcl`
   - **Kubernetes/k8s**: `*.secret.yaml`, `secrets/`, `.kube/`, `kubeconfig*`, `*.key`, `*.crt`

5. Phân tích cấu trúc tasks.md và trích xuất:
   - **Các giai đoạn task**: Thiết lập, Kiểm thử, Phần lõi, Tích hợp, Hoàn thiện
   - **Phụ thuộc task**: Quy tắc thực thi tuần tự song song
   - **Chi tiết task**: ID, mô tả, đường dẫn file, markers song song [P]
   - **Quy trình thực thi**: Thứ tự và yêu cầu phụ thuộc

6. Thực thi triển khai theo kế hoạch task:
   - **Thực thi theo từng giai đoạn**: Hoàn thành từng giai đoạn trước khi chuyển sang giai đoạn tiếp theo
   - **Tôn trọng phụ thuộc**: Chạy các task tuần tự theo thứ tự, các task song song [P] có thể chạy cùng lúc
   - **Theo hướng tiếp cận TDD**: Thực thi các task kiểm thử trước các task triển khai tương ứng
   - **Phối hợp dựa trên file**: Các task ảnh hưởng đến cùng file phải chạy tuần tự
   - **Điểm kiểm tra xác thực**: Xác nhận sự hoàn thành của từng giai đoạn trước khi tiếp tục

7. Quy tắc thực thi triển khai:
   - **Thiết lập trước tiên**: Khởi tạo cấu trúc dự án, dependencies, cấu hình
   - **Kiểm thử trước code**: Nếu cần viết kiểm thử cho contracts, entities và kịch bản tích hợp
   - **Phát triển phần lõi**: Triển khai models, services, CLI commands, endpoints
   - **Công việc tích hợp**: Kết nối database, middleware, logging, external services
   - **Hoàn thiện và xác thực**: Unit tests, tối ưu hóa hiệu suất, tài liệu hóa

8. Theo dõi tiến độ và xử lý lỗi:
   - Báo cáo tiến độ sau mỗi task hoàn thành
   - Dừng thực thi nếu bất kỳ task không song song nào thất bại
   - Đối với các task song song [P], tiếp tục với các task thành công, báo cáo các task thất bại
   - Cung cấp thông báo lỗi rõ ràng với ngữ cảnh để debug
   - Đề xuất bước tiếp theo nếu triển khai không thể tiếp tục
   - **QUAN TRỌNG** Đối với các task đã hoàn thành, đảm bảo đánh dấu task là [X] trong file tasks.

9. Xác thực hoàn thành:
   - Xác minh tất cả các task bắt buộc đã hoàn thành
   - Kiểm tra các tính năng đã triển khai khớp với đặc tả gốc
   - Xác thực rằng các bài kiểm thử pass và độ phủ đáp ứng yêu cầu
   - Xác nhận triển khai tuân theo kế hoạch kỹ thuật
   - Báo cáo trạng thái cuối cùng với tóm tắt công việc đã hoàn thành

Lưu ý: Lệnh này giả định rằng một sự phân bổ task hoàn chỉnh tồn tại trong tasks.md. Nếu các task chưa hoàn chỉnh hoặc bị thiếu, đề xuất chạy `/speckit.tasks` trước để tạo lại danh sách task.
