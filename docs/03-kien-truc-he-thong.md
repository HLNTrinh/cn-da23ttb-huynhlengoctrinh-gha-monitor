# 3. Kiến trúc hệ thống

```text
React + Vite (5173)
       │ REST / JSON
       ▼
Express API (4000) ◄──── GitHub REST API
       │                    ▲
       ▼                    │ HTTPS webhook
   MongoDB (27017) ◄────────┘
```

Backend chia theo routes → controllers → services → models. `githubService` gọi GitHub và upsert dữ liệu; `webhookService` kiểm tra chữ ký và chuyển tiếp event. Frontend gọi API qua các module trong `src/services`.

Khi dùng webhook, endpoint công khai là `POST /api/webhooks/github`. GitHub gửi chữ ký trong `X-Hub-Signature-256`; backend so sánh chữ ký an toàn theo thời gian với `GITHUB_WEBHOOK_SECRET`. Endpoint webhook không dùng API key REST.
