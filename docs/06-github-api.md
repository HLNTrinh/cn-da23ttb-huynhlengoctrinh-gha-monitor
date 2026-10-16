# 6. GitHub API

Backend dùng Octokit REST. Token lưu trong biến môi trường `GITHUB_TOKEN`, không gửi xuống trình duyệt. Đồng bộ repository dùng `/user/repos`; mỗi repository gọi Actions API để lấy workflows, workflow runs, jobs và steps.

Mỗi lượt đồng bộ lấy tối đa 100 repository, workflow, runs hoặc jobs. GitHub có thể áp dụng rate limit; nếu theo dõi nhiều repository, đồng bộ theo repository hoặc cấu hình webhook để giảm polling.

API cần quyền đọc metadata và GitHub Actions. Repository private còn cần token được cấp quyền truy cập repository đó.
