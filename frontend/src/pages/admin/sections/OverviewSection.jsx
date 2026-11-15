import { syncAllAdminRepositories } from '../../../services/adminApi.js';

export default function OverviewSection({ user, overview, busy, perform, onNavigate }) {
  return (
    <>
      {/* Welcome Banner */}
      <section className="admin-welcome-hero">
        <div className="admin-welcome-text">
          <span className="admin-hero-badge">BẢNG ĐIỀU KHIỂN QUẢN TRỊ</span>
          <p className="admin-hero-sub">
            Xin chào <strong>{user?.email || 'Quản trị viên'}</strong>. Quản trị phân quyền người dùng, thiết lập quy tắc tự động báo lỗi và theo dõi tình trạng kho lưu trữ.
          </p>
        </div>

        <button
          type="button"
          className="button primary admin-sync-hero-btn"
          disabled={busy}
          onClick={() =>
            perform(
              syncAllAdminRepositories,
              'Đã hoàn tất đồng bộ toàn bộ kho lưu trữ từ GitHub.'
            )
          }
        >
          <span className={busy ? 'spinner-inline' : ''}></span>
          <span>{busy ? 'Đang đồng bộ…' : 'Đồng bộ toàn bộ kho'}</span>
        </button>
      </section>

      {/* Metric Cards Grid - Interactive */}
      <section className="admin-metrics-grid">
        <div
          className="admin-stat-card tone-blue"
          onClick={() => onNavigate && onNavigate('users')}
          role="button"
          tabIndex={0}
          title="Bấm để quản lý người dùng GitHub"
        >
          <div className="admin-stat-data">
            <span className="admin-stat-label">Người dùng GitHub</span>
            <strong className="admin-stat-value">{overview?.users ?? 0}</strong>
            <span className="admin-stat-hint">Xem và phân quyền </span>
          </div>
        </div>

        <div
          className="admin-stat-card tone-green"
          onClick={() => onNavigate && onNavigate('repositories')}
          role="button"
          tabIndex={0}
          title="Bấm để quản lý kho lưu trữ"
        >
          <div className="admin-stat-data">
            <span className="admin-stat-label">Kho lưu trữ theo dõi</span>
            <strong className="admin-stat-value">{overview?.repositories ?? 0}</strong>
            <span className="admin-stat-hint">Trạng thái giám sát </span>
          </div>
        </div>

        <div
          className="admin-stat-card tone-purple"
          onClick={() => onNavigate && onNavigate('alerts')}
          role="button"
          tabIndex={0}
          title="Bấm để xem quy tắc cảnh báo"
        >
          <div className="admin-stat-data">
            <span className="admin-stat-label">Quy tắc cảnh báo</span>
            <strong className="admin-stat-value">{overview?.alerts ?? 0}</strong>
            <span className="admin-stat-hint">Thiết lập tự động </span>
          </div>
        </div>

        <div
          className="admin-stat-card tone-red"
          onClick={() => onNavigate && onNavigate('alerts')}
          role="button"
          tabIndex={0}
          title="Bấm để kiểm tra các cảnh báo mới"
        >
          <div className="admin-stat-data">
            <span className="admin-stat-label">Cảnh báo chưa xem</span>
            <strong className="admin-stat-value">{overview?.unreadAlerts ?? 0}</strong>
            <span className="admin-stat-hint">Cần kiểm tra ngay →</span>
          </div>
        </div>
      </section>

      {/* Quick Shortcuts Grid */}
      <section className="panel admin-panel">
        <div className="panel-heading">
          <div>
            <h2>Phân hệ quản trị nhanh</h2>
            <p className="muted">Chọn chức năng cần điều chỉnh để mở phân hệ quản lý chi tiết</p>
          </div>
        </div>

        <div className="admin-quick-links-grid">
          <div
            className="admin-quick-card"
            onClick={() => onNavigate && onNavigate('accounts')}
            role="button"
            tabIndex={0}
          >
            <div className="quick-card-head">
              <h3>Tài khoản Quản trị</h3>
            </div>
            <p>Tạo tài khoản quản trị nội bộ, phân quyền và đổi mật khẩu.</p>
            <span className="quick-arrow">Xem chi tiết</span>
          </div>

          <div
            className="admin-quick-card"
            onClick={() => onNavigate && onNavigate('users')}
            role="button"
            tabIndex={0}
          >
            <div className="quick-card-head">
              <h3>Người dùng GitHub</h3>
            </div>
            <p>Quản lý tài khoản đăng nhập OAuth, phân quyền Viewer hoặc Admin.</p>
            <span className="quick-arrow">Xem chi tiết</span>
          </div>

          <div
            className="admin-quick-card"
            onClick={() => onNavigate && onNavigate('alerts')}
            role="button"
            tabIndex={0}
          >
            <div className="quick-card-head">
              <h3>Quy tắc cảnh báo</h3>
            </div>
            <p>Cấu hình bắt lỗi webhook khi workflow thất bại hoặc hoàn thành.</p>
            <span className="quick-arrow">Xem chi tiết</span>
          </div>

          <div
            className="admin-quick-card"
            onClick={() => onNavigate && onNavigate('repositories')}
            role="button"
            tabIndex={0}
          >
            <div className="quick-card-head">
              <h3>Kho lưu trữ</h3>
            </div>
            <p>Bật hoặc tắt theo dõi từng repository, đồng bộ lịch sử GitHub Actions.</p>
            <span className="quick-arrow">Xem chi tiết</span>
          </div>

          <div
            className="admin-quick-card"
            onClick={() => onNavigate && onNavigate('activity')}
            role="button"
            tabIndex={0}
          >
            <div className="quick-card-head">
              <h3>Nhật ký hoạt động</h3>
            </div>
            <p>Xem toàn bộ lịch sử đăng nhập, thay đổi phân quyền và thao tác hệ thống.</p>
            <span className="quick-arrow">Xem chi tiết</span>
          </div>
        </div>
      </section>
    </>
  );
}