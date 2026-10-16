# 8. Giao diện

Giao diện React responsive có các màn hình:

- **Tổng quan** — số runs, thành công/thất bại/đang chạy và runs gần đây.
- **Repositories** — tải danh sách GitHub, đồng bộ tất cả và xem workflows/runs theo repository.
- **Workflows** — danh sách workflow và các lần chạy của từng workflow.
- **Workflow runs** — lọc trạng thái, xem jobs/steps và mở run trên GitHub.
- **Thống kê** — tỷ lệ thành công, thời lượng trung bình và biểu đồ số runs theo ngày.

Frontend lấy API base URL từ `VITE_API_URL`. Nếu bật `API_KEY` cho REST API, phải đặt cùng giá trị `VITE_API_KEY` khi build giao diện. Giá trị này là công khai trong bundle; không dùng làm bí mật cho ứng dụng public.
