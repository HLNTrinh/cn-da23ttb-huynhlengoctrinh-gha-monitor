# 1. Giới thiệu

GitHub Actions Monitoring là ứng dụng web tập trung để xem trạng thái repository và pipeline CI/CD: workflow, lần chạy, job, step, tỷ lệ thành công và thời lượng chạy.

Ứng dụng sử dụng GitHub REST API để đồng bộ dữ liệu lịch sử và GitHub Webhooks để nhận cập nhật gần thời gian thực. Dữ liệu được lưu trong MongoDB; giao diện sử dụng React và Vite.

## Phạm vi hiện tại

- Liệt kê repository mà token GitHub có thể truy cập.
- Đồng bộ workflow, tối đa 100 workflow run gần nhất và jobs/steps của từng run.
- Xem chi tiết run, repository, workflow và thống kê 30 ngày.
- Nhận event `workflow_run`, `workflow_job` qua webhook có xác minh HMAC SHA-256.
