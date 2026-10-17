import { useSearchParams } from 'react-router-dom';
import { startGitHubLogin } from '../services/authApi.js';

const loginErrors = {
  access_denied: 'Bạn đã hủy đăng nhập GitHub.',
  invalid_oauth_state: 'Phiên đăng nhập không hợp lệ hoặc đã hết hạn. Hãy thử lại.',
  oauth_exchange_failed: 'GitHub không chấp nhận OAuth credentials. Hãy kiểm tra Client ID và Client Secret.',
  github_profile_failed: 'Không thể lấy thông tin tài khoản từ GitHub. Hãy thử lại.',
  oauth_connection_failed: 'Không thể kết nối đến GitHub. Hãy kiểm tra kết nối mạng rồi thử lại.',
  not_allowed: 'Tài khoản GitHub này chưa được cấp quyền vào dashboard.',
  oauth_not_configured: 'GitHub OAuth chưa được cấu hình trên máy chủ.'
};

export default function Login({ configuration }) {
  const [searchParams] = useSearchParams();
  const error = loginErrors[searchParams.get('error')];

  return (
    <main className="login-page">
      <section className="login-card">
        <div className="login-brand"><span className="brand-mark">GH</span><span>Actions<span className="brand-light"> Monitor</span></span></div>
        <p className="eyebrow">GITHUB ACTIONS MONITOR</p>
        <h1>Đăng nhập</h1>
        <p className="muted">Dùng tài khoản GitHub được cấp quyền để tiếp tục.</p>
        {error && <div className="notice error-notice" role="alert"><strong>Không thể đăng nhập</strong><p>{error}</p></div>}
        {configuration.configured ? (
          <button className="button primary login-button" onClick={startGitHubLogin}>
            <span aria-hidden="true">GH</span> Tiếp tục với GitHub
          </button>
        ) : (
          <div className="login-setup">
            <strong>Chưa cấu hình GitHub OAuth</strong>
            <p>Thêm các biến sau vào file <code>.env</code> ở thư mục gốc, sau đó rebuild Docker:</p>
            <ul>{configuration.missing.map((name) => <li key={name}><code>{name}</code></li>)}</ul>
            <p>Trong GitHub OAuth App, đặt Authorization callback URL thành:</p>
            <code className="callback-url">http://localhost:4000/api/auth/github/callback</code>
            <p className="muted">Chỉ các username trong <code>GITHUB_OAUTH_ALLOWED_USERS</code> mới được đăng nhập. Không chia sẻ Client Secret.</p>
          </div>
        )}
      </section>
    </main>
  );
}
