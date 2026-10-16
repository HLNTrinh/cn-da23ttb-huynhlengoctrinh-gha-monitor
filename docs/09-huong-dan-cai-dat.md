# 9. Hướng dẫn cài đặt

## Docker Compose (Windows)

```powershell
Copy-Item .env.example .env
# Sửa .env, thêm GitHub token thực
docker compose up --build
```

Mở <http://localhost:5173>. Bấm **Tải repositories** để nhập repository có quyền truy cập, sau đó bấm **Đồng bộ tất cả** để tải workflow runs.

## Cài đặt thủ công

```powershell
Copy-Item backend/.env.example backend/.env
Copy-Item frontend/.env.example frontend/.env
```

Sửa các connection string và token trong `backend/.env`; bật MongoDB. Sau đó mở hai PowerShell:

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

Backend health: `http://localhost:4000/api/health`. Khi triển khai ra Internet, cấu hình HTTPS, authentication ở reverse proxy, CORS theo đúng origin và không đưa API key vào bundle frontend.
