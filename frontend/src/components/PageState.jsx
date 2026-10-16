export function Loading() {
  return <div className="empty-state"><span className="spinner" />Đang tải dữ liệu…</div>;
}

export function ErrorState({ message }) {
  return <div className="notice error-notice"><strong>Không thể tải dữ liệu</strong><p>{message}</p><small>Hãy kiểm tra API, MongoDB và cấu hình GitHub.</small></div>;
}
