# 5. API

Mọi response REST có dạng `{ "success": true, "data": ... }`; lỗi có `success: false` và `message`. Nếu đặt `API_KEY`, gửi `Authorization: Bearer <API_KEY>` với mọi API dưới `/api`, ngoại trừ health check và webhook.

| Method | Endpoint | Mô tả |
|---|---|---|
| GET | `/api/health` | Health check |
| GET | `/api/repositories` | Liệt kê repository |
| GET | `/api/repositories/:owner/:name` | Chi tiết repository |
| POST | `/api/repositories/sync` | Lấy repository từ token GitHub |
| POST | `/api/repositories/sync-all` | Đồng bộ repository, workflow, run và jobs |
| POST | `/api/repositories/:owner/:name/sync` | Đồng bộ một repository |
| GET | `/api/workflows?repository=:id` | Liệt kê workflows |
| GET | `/api/workflows/:id` | Chi tiết workflow |
| GET | `/api/runs?page=1&limit=25` | Danh sách runs có phân trang; có thể lọc repository, workflow, status, conclusion |
| GET | `/api/runs/:id` | Chi tiết run kèm jobs và steps |
| GET | `/api/jobs/run/:runId` | Jobs của một run |
| GET | `/api/jobs/:id` | Job và các step |
| GET | `/api/statistics` | Tổng hợp 30 ngày gần nhất |

`limit` của danh sách run được giới hạn tối đa 100. Các ID nội bộ trong đường dẫn là MongoDB ObjectId.
