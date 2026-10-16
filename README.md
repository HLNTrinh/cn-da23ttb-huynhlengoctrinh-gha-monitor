# GitHub Actions Monitoring

Dashboard theo dõi repository, workflow, workflow run, job và step của GitHub Actions. Backend Express lưu dữ liệu trong MongoDB; frontend React hiển thị thống kê và trạng thái CI/CD.

## Chạy nhanh với Docker

1. Cài Docker Desktop và tạo Personal Access Token GitHub có quyền đọc metadata, repository và Actions. Với fine-grained token, cấp **Metadata: read**, **Contents: read** và **Actions: read** cho các repository cần theo dõi.
2. Tạo file `.env` ở thư mục gốc từ mẫu bên dưới và điền token:

   ```powershell
   Copy-Item .env.example .env
   ```

3. Khởi động:

   ```powershell
   docker compose up --build
   ```

4. Mở giao diện tại <http://localhost:5173>, nhấn **Tải repositories**, sau đó **Đồng bộ tất cả**. API health check: <http://localhost:4000/api/health>.

## Chạy cục bộ

- Cài Node.js 20+ và MongoDB 7+.
- Sao chép `backend/.env.example` thành `backend/.env`; điền `MONGODB_URI`, `GITHUB_TOKEN` và tùy chọn `API_KEY`.
- Tạo `frontend/.env` từ `frontend/.env.example`. Nếu đã đặt `API_KEY` cho backend, đặt cùng giá trị vào `VITE_API_KEY`.
- Cài dependency và chạy hai tiến trình trong cửa sổ PowerShell riêng:

  ```powershell
  cd backend
  npm install
  npm run dev
  ```

  ```powershell
  cd frontend
  npm install
  npm run dev
  ```

## Cấu hình

| Biến | Mô tả |
|---|---|
| `MONGODB_URI` | MongoDB connection string |
| `GITHUB_TOKEN` | Token dùng để đọc repositories, workflows, runs và jobs |
| `API_KEY` | Tùy chọn; nếu đặt, API yêu cầu header `Authorization: Bearer <API_KEY>` |
| `GITHUB_WEBHOOK_SECRET` | Secret dùng để xác thực chữ ký webhook |
| `CLIENT_URL` | Origin frontend được phép gọi API (có thể phân cách nhiều origin bằng dấu phẩy) |
| `SYNC_ON_START` | Đặt `true` để đồng bộ ngay khi backend khởi động |

Không đưa `.env`, token GitHub hoặc API key vào Git. Không dùng API key frontend như cơ chế xác thực cho ứng dụng public: biến `VITE_*` được nhúng vào bundle trình duyệt. Hãy triển khai sau reverse proxy có authentication phù hợp nếu mở ra Internet.

## API tiêu biểu

- `GET /api/health`
- `GET /api/repositories`, `POST /api/repositories/sync`, `POST /api/repositories/sync-all`
- `GET /api/repositories/:owner/:repo`, `POST /api/repositories/:owner/:repo/sync`
- `GET /api/workflows`, `GET /api/workflows/:id`
- `GET /api/runs?page=1&limit=25`, `GET /api/runs/:id`
- `GET /api/jobs/run/:runId`, `GET /api/jobs/:id`
- `GET /api/statistics`
- `POST /api/webhooks/github` — sự kiện `workflow_run` và `workflow_job`; phải cấu hình secret trùng `GITHUB_WEBHOOK_SECRET`.

## Cấu trúc

- `backend/`: REST API, đồng bộ GitHub, MongoDB và xử lý webhook.
- `frontend/`: React dashboard.
- `database/`: hướng dẫn và tiện ích khởi tạo model.
- `github/`: workflow CI/CD và payload webhook mẫu.
- `docs/`: tài liệu cài đặt, kiến trúc, database, API, webhook và giao diện.
