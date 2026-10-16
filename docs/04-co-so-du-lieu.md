# 4. Cơ sở dữ liệu

MongoDB/Mongoose tạo collection và index tự động khi backend khởi động.

| Collection | Dữ liệu chính | Quan hệ |
|---|---|---|
| `repositories` | GitHub ID, owner, tên, nhánh mặc định, URL | Một repository có nhiều workflow/run |
| `workflows` | Workflow ID, tên, file YAML, trạng thái | Thuộc repository |
| `workflowruns` | Branch, commit, actor, event, status/conclusion, thời gian | Thuộc repository; có thể gắn workflow |
| `jobs` | Tên job, runner, trạng thái và thời gian | Thuộc workflow run |
| `steps` | Tên step, thứ tự, trạng thái và thời gian | Thuộc job |

ID từ GitHub được lưu làm khóa đồng bộ để upsert không tạo bản sao khi poll/webhook cập nhật cùng một thực thể.
