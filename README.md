# GitHub Actions Monitoring

Dashboard theo dõi repository, workflow, workflow run, job và step của GitHub Actions. Backend Express lưu dữ liệu trong MongoDB; frontend React hiển thị thống kê và trạng thái CI/CD.

## Chạy nhanh với Docker

1. Cài Docker Desktop và tạo Personal Access Token GitHub có quyền đọc metadata, repository và Actions. Với fine-grained token, cấp **Metadata: read**, **Contents: read** và **Actions: read** cho các repository cần theo dõi.
2. Tạo các file cấu hình từ mẫu:

   ```powershell
   Copy-Item .env.example .env
   Copy-Item backend\.env.example backend\.env
   ```

3. Tạo GitHub OAuth App trong **Settings → Developer settings → OAuth Apps**. Đặt Homepage URL là `http://localhost:5173` và Authorization callback URL là `http://localhost:4000/api/auth/github/callback`.
4. Điền `GITHUB_TOKEN`, `GITHUB_OAUTH_ALLOWED_USERS` và `SESSION_SECRET` trong file `.env` ở thư mục gốc. Điền Client ID và Client Secret của OAuth App trong `backend\.env`.
5. Khởi động:

   ```powershell
   docker compose up --build
   ```

6. Mở giao diện tại <http://localhost:5173>, đăng nhập bằng GitHub, nhấn **Tải repositories**, sau đó **Đồng bộ tất cả**. API health check: <http://localhost:4000/api/health>.

Tạo `SESSION_SECRET` ngẫu nhiên trong PowerShell bằng:

```powershell
[Convert]::ToBase64String((1..48 | ForEach-Object { Get-Random -Maximum 256 }))
```

## Chạy cục bộ

- Cài Node.js 20+ và MongoDB 7+.
- Sao chép `backend/.env.example` thành `backend/.env`; điền `MONGODB_URI`, `GITHUB_TOKEN` và các biến GitHub OAuth.
- Tạo GitHub OAuth App với callback URL `http://localhost:4000/api/auth/github/callback`; trong `backend/.env` điền Client ID, Client Secret, username được phép và một `SESSION_SECRET` ngẫu nhiên.
- Tạo `frontend/.env` từ `frontend/.env.example`. `VITE_API_KEY` chỉ cần thiết khi dùng chế độ cũ `AUTH_MODE=none` cùng API key.
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

Khi `AUTH_MODE=github`, dashboard yêu cầu phiên OAuth cookie; `API_KEY` chỉ được dùng ở chế độ `AUTH_MODE=none`.

| Biến | Mô tả |
|---|---|
| `MONGODB_URI` | MongoDB connection string |
| `GITHUB_TOKEN` | Token dùng để đọc repositories, workflows, runs và jobs |
| `AUTH_MODE` | `github` để bắt buộc đăng nhập OAuth (mặc định); `none` để tắt OAuth |
| `GITHUB_OAUTH_CLIENT_ID` / `GITHUB_OAUTH_CLIENT_SECRET` | Credentials của GitHub OAuth App; chỉ đặt trong backend |
| `GITHUB_OAUTH_ALLOWED_USERS` | Danh sách username GitHub được phép, phân cách bằng dấu phẩy |
| `GITHUB_OAUTH_REDIRECT_URI` | Callback URL OAuth; mặc định `http://localhost:4000/api/auth/github/callback` |
| `SESSION_SECRET` | Khóa ký cookie phiên đăng nhập, tối thiểu 32 ký tự ngẫu nhiên |
| `NODE_ENV` | Đặt `production` trên HTTPS để cookie phiên đăng nhập chỉ được gửi qua kết nối bảo mật |
| `API_KEY` | Tùy chọn; nếu đặt, API yêu cầu header `Authorization: Bearer <API_KEY>` |
| `GITHUB_WEBHOOK_SECRET` | Secret dùng để xác thực chữ ký webhook |
| `CLIENT_URL` | Origin frontend được phép gọi API (có thể phân cách nhiều origin bằng dấu phẩy) |
| `SYNC_ON_START` | Đặt `true` để đồng bộ ngay khi backend khởi động |

Không đưa `.env`, token GitHub hoặc API key vào Git. Không dùng API key frontend như cơ chế xác thực cho ứng dụng public: biến `VITE_*` được nhúng vào bundle trình duyệt. Hãy triển khai sau reverse proxy có authentication phù hợp nếu mở ra Internet.

## API tiêu biểu

- `GET /api/health`
- `GET /api/auth/me`, `GET /api/auth/github`, `GET /api/auth/github/callback`, `POST /api/auth/logout`
- `GET /api/repositories`, `POST /api/repositories/sync`, `POST /api/repositories/sync-all`
- `GET /api/repositories/:owner/:repo`, `POST /api/repositories/:owner/:repo/sync`
- `GET /api/workflows`, `GET /api/workflows/:id`
- `GET /api/runs?page=1&limit=25`, `GET /api/runs/:id`
- `GET /api/commits?page=1&limit=25` — tối đa 100 commit mới nhất trên nhánh mặc định của mỗi repository, chỉ khi commit có workflow run tương ứng.
- `GET /api/jobs/run/:runId`, `GET /api/jobs/:id`
- `GET /api/statistics`
- `POST /api/webhooks/github` — sự kiện `workflow_run` và `workflow_job`; phải cấu hình secret trùng `GITHUB_WEBHOOK_SECRET`.

## Cấu trúc

- `backend/`: REST API, đồng bộ GitHub, MongoDB và xử lý webhook.
- `frontend/`: React dashboard.
- `database/`: hướng dẫn và tiện ích khởi tạo model.
- `github/`: workflow CI/CD và payload webhook mẫu.
- `docs/`: tài liệu cài đặt, kiến trúc, database, API, webhook và giao diện.
