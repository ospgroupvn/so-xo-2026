---
description: Chuyển đổi các task đã có thành GitHub issues có thể thực hiện được, được sắp xếp theo thứ tự phụ thuộc cho tính năng dựa trên các tài liệu thiết kế có sẵn.
tools: ['github/github-mcp-server/issue_write']
---

## Đầu vào của người dùng

```text
$ARGUMENTS
```

Bạn **BẮT BUỘC** phải xem xét đầu vào của người dùng trước khi tiếp tục (nếu không rỗng).

## Tóm tắt các bước

1. Chạy lệnh `.specify/scripts/bash/check-prerequisites.sh --json --require-tasks --include-tasks` từ thư mục gốc của repo và phân tích FEATURE_DIR cùng danh sách AVAILABLE_DOCS. Tất cả đường dẫn phải là đường dẫn tuyệt đối. Với các dấu ngoặc đơn trong tham số như "I'm Groot", hãy sử dụng cú pháp escape: ví dụ 'I'\''m Groot' (hoặc dùng dấu ngoặc kép nếu có thể: "I'm Groot").
1. Từ kết quả script đã chạy, trích xuất đường dẫn đến **tasks**.
1. Lấy Git remote bằng cách chạy:

```bash
git config --get remote.origin.url
```

> [!CAUTION]
> CHỈ TIẾP TỤC CÁC BƯỚC TIẾP THEO NẾU REMOTE LÀ URL CỦA GITHUB

1. Với từng task trong danh sách, sử dụng GitHub MCP server để tạo issue mới trong repository tương ứng với Git remote đó.

> [!CAUTION]
> TUYỆT ĐỐI KHÔNG TẠO ISSUES TRONG CÁC REPOSITORY KHÔNG KHỚP VỚI REMOTE URL
