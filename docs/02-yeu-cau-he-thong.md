# 2. Yêu cầu hệ thống

## Runtime

- Node.js 20 trở lên và npm.
- MongoDB 7 trở lên (local hoặc MongoDB Atlas).
- Tài khoản GitHub và Personal Access Token có quyền đọc các repository cần theo dõi.
- Docker Desktop là tùy chọn để chạy toàn bộ hệ thống qua Compose.

## Cấu hình GitHub token

Fine-grained token cần metadata read, contents read và Actions read. Với classic token, chọn phạm vi quyền đọc repository phù hợp với loại repository. Chỉ cấp quyền tối thiểu cần dùng; không commit token vào source control.

Frontend chạy tại `http://localhost:5173`, API chạy tại `http://localhost:4000`. Cấu hình `CLIENT_URL` nếu frontend ở origin khác.
