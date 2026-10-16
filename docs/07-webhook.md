# 7. Webhook

1. Đặt `GITHUB_WEBHOOK_SECRET` trong backend.
2. Tạo webhook tại GitHub repository/organization trỏ đến `https://<domain>/api/webhooks/github`.
3. Chọn content type JSON và cùng secret đã cấu hình.
4. Đăng ký events `Workflow runs` và `Workflow jobs`.
5. Đảm bảo reverse proxy chuyển nguyên request body tới backend để xác thực `X-Hub-Signature-256`.

Backend trả `401` nếu secret/chữ ký thiếu hoặc không khớp, `202` nếu payload được chấp nhận. Webhook workflow run sẽ đồng bộ jobs mới nhất qua GitHub API; do đó backend cần có token với quyền Actions read. Payload ví dụ: `../github/webhook/webhook-example.json`.
