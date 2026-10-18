# GitHub Actions Monitoring

Dashboard theo dõi repository, workflow, workflow run, job và step của GitHub Actions. Backend Express lưu dữ liệu trong MongoDB; frontend React hiển thị thống kê và trạng thái CI/CD.

## Tính năng

- Đăng nhập GitHub OAuth và giới hạn người dùng được phép truy cập.
- Lấy repository mà GitHub token có quyền đọc.
- Đồng bộ workflow, workflow run, job và step.
- Đồng bộ lịch sử commit trên nhánh mặc định của các repository đã kết nối, kể cả commit chưa chạy workflow.
- Theo dõi thống kê và lịch sử chạy workflow trên dashboard.
- Nhận sự kiện GitHub webhook cho `workflow_run` và `workflow_job`.

## Chạy nhanh bằng Docker Compose

Yêu cầu: Docker Desktop, GitHub token có quyền đọc metadata, nội dung repository và Actions, cùng một GitHub OAuth App.

1. Tạo file cấu hình từ mẫu:

   ```powershell
   Copy-Item .env.example .env
   Copy-Item backend\.env.example backend\.env
   ```

2. Tạo GitHub OAuth App trong **Settings → Developer settings → OAuth Apps**:
   - Homepage URL: `http://localhost:5173`
   - Authorization callback URL: `http://localhost:4000/api/auth/github/callback`

3. Cấu hình `.env` ở thư mục gốc:
   - `GITHUB_TOKEN`: token đọc các repository cần theo dõi.
   - `GITHUB_OAUTH_ALLOWED_USERS`: username GitHub được phép đăng nhập.
   - `SESSION_SECRET`: chuỗi ngẫu nhiên tối thiểu 32 ký tự.

4. Cấu hình `backend\.env`:
   - `GITHUB_OAUTH_CLIENT_ID` và `GITHUB_OAUTH_CLIENT_SECRET` của OAuth App.
   - Kiểm tra `GITHUB_OAUTH_ALLOWED_USERS` và `SESSION_SECRET` đã được đặt. Giá trị trong `.env` gốc sẽ được Docker Compose truyền vào backend.

5. Khởi động ứng dụng:

   ```powershell
   docker compose up --build
   ```

6. Mở <http://localhost:5173>, đăng nhập bằng GitHub, chọn **Tải repositories**, rồi **Đồng bộ tất cả**.

Frontend: <http://localhost:5173> · Backend health check: <http://localhost:4000/api/health>

Có thể tạo `SESSION_SECRET` bằng PowerShell:

```powershell
[Convert]::ToBase64String((1..48 | ForEach-Object { Get-Random -Maximum 256 }))
```

## Chạy cục bộ

Yêu cầu: Node.js 20+, MongoDB 7+ đang chạy, và GitHub OAuth App.

1. Sao chép cấu hình:

   ```powershell
   Copy-Item backend\.env.example backend\.env
   Copy-Item frontend\.env.example frontend\.env
   ```

2. Trong `backend\.env`, cấu hình `MONGODB_URI`, `GITHUB_TOKEN`, `GITHUB_OAUTH_CLIENT_ID`, `GITHUB_OAUTH_CLIENT_SECRET`, `GITHUB_OAUTH_ALLOWED_USERS` và `SESSION_SECRET`. Callback URL mặc định là `http://localhost:4000/api/auth/github/callback`.

3. Mở hai cửa sổ PowerShell riêng và chạy backend, frontend:

   ```powershell
   Set-Location backend
   npm install
   npm run dev
   ```

   ```powershell
   Set-Location frontend
   npm install
   npm run dev
   ```

## Cấu hình

| Biến | Mô tả |
|---|---|
| `MONGODB_URI` | MongoDB connection string. |
| `GITHUB_TOKEN` | Token backend dùng để đọc repository, workflow, run và job. |
| `AUTH_MODE` | `github` để yêu cầu đăng nhập OAuth (mặc định); `none` để tắt OAuth. |
| `GITHUB_OAUTH_CLIENT_ID` / `GITHUB_OAUTH_CLIENT_SECRET` | Thông tin GitHub OAuth App; chỉ cấu hình ở backend. |
| `GITHUB_OAUTH_ALLOWED_USERS` | Username GitHub được phép đăng nhập, phân cách bằng dấu phẩy. |
| `GITHUB_OAUTH_REDIRECT_URI` | OAuth callback URL; mặc định `http://localhost:4000/api/auth/github/callback`. |
| `SESSION_SECRET` | Khóa ký session cookie; dùng chuỗi ngẫu nhiên tối thiểu 32 ký tự. |
| `CLIENT_URL` | Origin frontend được backend cho phép gọi API. |
| `API_KEY` | Khóa API tùy chọn khi chạy `AUTH_MODE=none`. |
| `GITHUB_WEBHOOK_SECRET` | Secret xác thực chữ ký webhook. |
| `SYNC_ON_START` | Đặt `true` để đồng bộ khi backend khởi động. |
| `PORT` | Cổng backend; mặc định `4000`. |

Không commit `.env`, GitHub token, OAuth client secret hoặc API key. Không dùng biến `VITE_*` làm bí mật: giá trị frontend được nhúng vào bundle và có thể xem từ trình duyệt.

## API

Các endpoint tiêu biểu:

| Method | Endpoint | Mô tả |
|---|---|---|
| `GET` | `/api/health` | Health check. |
| `GET` | `/api/auth/me` | Thông tin phiên đăng nhập hiện tại. |
| `GET` | `/api/auth/github` | Bắt đầu đăng nhập GitHub OAuth. |
| `POST` | `/api/auth/logout` | Đăng xuất. |
| `GET` | `/api/repositories` | Danh sách repository. |
| `POST` | `/api/repositories/sync` | Tải repository từ GitHub. |
| `POST` | `/api/repositories/sync-all` | Đồng bộ tất cả repository. |
| `GET` | `/api/repositories/:owner/:name` | Chi tiết repository. |
| `POST` | `/api/repositories/:owner/:name/sync` | Đồng bộ một repository. |
| `GET` | `/api/workflows` | Danh sách workflow. |
| `GET` | `/api/workflows/:id` | Chi tiết workflow. |
| `GET` | `/api/runs?page=1&limit=25` | Danh sách workflow run có phân trang. |
| `GET` | `/api/runs/:id` | Chi tiết run, kèm jobs và steps. |
| `GET` | `/api/commits?page=1&limit=25&repository=owner/name` | Danh sách commit từ lịch sử repository, có thể lọc theo repository. |
| `POST` | `/api/commits/sync` | Đồng bộ lịch sử commit nhánh mặc định từ repository GitHub; JSON body: `{"repository":"owner/name"}`. |
| `GET` | `/api/jobs/run/:runId` | Jobs của một run. |
| `GET` | `/api/jobs/:id` | Chi tiết job và steps. |
| `GET` | `/api/statistics` | Thống kê workflow. |
| `POST` | `/api/webhooks/github` | Nhận webhook `workflow_run` và `workflow_job`. |

Tài liệu chi tiết về endpoint, webhook và cài đặt nằm trong thư mục [`docs`](./docs/).

## Cấu trúc dự án

- `backend/`: REST API Express, GitHub integration và kết nối MongoDB.
- `frontend/`: giao diện dashboard React.
- `database/`: model và tiện ích khởi tạo dữ liệu.
- `docs/`: tài liệu yêu cầu, kiến trúc, cài đặt, API và webhook.
- `github/`: workflow và payload mẫu.
