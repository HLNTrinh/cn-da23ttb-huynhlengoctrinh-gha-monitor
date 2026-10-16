# Cơ sở dữ liệu

Ứng dụng dùng MongoDB và Mongoose. Các collection (`repositories`, `workflows`, `workflowruns`, `jobs`, `steps`) được tạo tự động khi backend kết nối lần đầu.

Không tạo dữ liệu GitHub giả trong seed. Sau khi cấu hình `GITHUB_TOKEN`, dùng nút **Tải repositories** hoặc gọi `POST /api/repositories/sync` để lấy repository thật.

```powershell
cd backend
npm run seed
```

Seed chỉ kiểm tra kết nối và khởi tạo model/index; `MONGODB_URI` phải trỏ tới database đang chạy.
