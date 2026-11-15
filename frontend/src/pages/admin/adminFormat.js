// Format ngày giờ chi tiết
export function formatExactDate(value) {
  if (!value) return '—';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '—';
  return date.toLocaleString('vi-VN', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  });
}

// Format thời gian tương đối
export function getRelativeTime(value) {
  if (!value) return 'Chưa có';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return 'Không xác định';

  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffSec = Math.round(diffMs / 1000);

  if (diffSec < 45) return 'Vừa xong';
  if (diffSec < 90) return '1 phút trước';

  const diffMin = Math.floor(diffSec / 60);
  if (diffMin < 60) return `${diffMin} phút trước`;

  const diffHour = Math.floor(diffMin / 60);
  if (diffHour < 24) return `${diffHour} giờ trước`;

  const diffDay = Math.floor(diffHour / 24);
  if (diffDay === 1) return 'Hôm qua';
  if (diffDay < 7) return `${diffDay} ngày trước`;

  const diffWeek = Math.floor(diffDay / 7);
  if (diffWeek < 5) return `${diffWeek} tuần trước`;

  const diffMonth = Math.floor(diffDay / 30);
  if (diffMonth < 12) return `${diffMonth} tháng trước`;

  return `${Math.floor(diffMonth / 12)} năm trước`;
}

// Format tên hành động trong nhật ký
export function formatAction(action) {
  const actions = {
    LOGIN_ADMIN: 'Đăng nhập Quản trị',
    LOGIN_USER: 'Đăng nhập GitHub',
    CHANGE_PASSWORD: 'Đổi mật khẩu',
    CREATE_ACCOUNT: 'Tạo tài khoản quản trị',
    UPDATE_ACCOUNT: 'Cập nhật tài khoản quản trị',
    ADD_USER: 'Thêm người dùng GitHub',
    UPDATE_USER: 'Cập nhật người dùng',
    DELETE_USER: 'Xóa người dùng',
    CREATE_ALERT_RULE: 'Tạo quy tắc cảnh báo',
    UPDATE_ALERT_RULE: 'Cập nhật quy tắc cảnh báo',
    DELETE_ALERT_RULE: 'Xóa quy tắc cảnh báo',
    SYNC_REPOSITORIES: 'Đồng bộ kho lưu trữ',
    UPDATE_REPOSITORY: 'Cập nhật kho lưu trữ'
  };
  return actions[action] || action;
}