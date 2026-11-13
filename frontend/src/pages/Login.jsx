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

function GitHubMark({ className }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M12 .297a12 12 0 0 0-3.794 23.385c.6.111.82-.261.82-.577v-2.234c-3.338.726-4.043-1.416-4.043-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.09-.745.083-.729.083-.729 1.205.084 1.84 1.237 1.84 1.237 1.07 1.834 2.807 1.304 3.492.997.108-.775.418-1.304.762-1.604-2.665-.304-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.536-1.524.117-3.176 0 0 1.008-.322 3.301 1.23a11.5 11.5 0 0 1 6.01 0c2.292-1.552 3.298-1.23 3.298-1.23.655 1.652.243 2.873.12 3.176.77.84 1.235 1.91 1.235 3.221 0 4.608-2.807 5.624-5.48 5.921.43.372.814 1.102.814 2.222v3.293c0 .319.216.694.825.576A12.002 12.002 0 0 0 12 .297Z" />
    </svg>
  );
}

export default function Login({ configuration }) {
  const [searchParams] = useSearchParams();
  const error = loginErrors[searchParams.get('error')];

  return (
    <main className="login-page">
      <section className="login-card">
        <div className="login-content">
          <div className="login-brand"><span className="brand-mark">GH</span><span>Actions<span className="brand-light"> Monitor</span></span></div>
          <p className="eyebrow"><span className="login-github-mark"><GitHubMark /></span> GITHUB ACTIONS MONITOR</p>
          <h1>Đăng nhập</h1>
          <p className="muted">Dùng tài khoản GitHub được cấp quyền để tiếp tục sử dụng hệ thống.</p>
          {error && <div className="notice error-notice" role="alert"><strong>Không thể đăng nhập</strong><p>{error}</p></div>}
          {configuration.configured ? (
            <button className="button primary login-button" onClick={startGitHubLogin}>
              <span className="login-button-mark"><GitHubMark /></span>
              <span>Tiếp tục với GitHub</span>
              <span className="login-button-arrow" aria-hidden="true">→</span>
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
        </div>
        <aside className="login-illustration" aria-hidden="true">
          <div className="login-orbit" />
          <span className="login-spark login-spark-one">✦</span>
          <span className="login-spark login-spark-two">✦</span>
          <div className="login-hero-mark"><GitHubMark /></div>
          <div className="login-float login-code">&lt;/&gt;</div>
          <div className="login-float login-chart"><i /><i /><i /></div>
        </aside>
      </section>
    </main>
  );
}
