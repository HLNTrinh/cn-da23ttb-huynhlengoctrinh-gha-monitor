import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext.jsx';

const titles = {
  '/': 'Tổng quan',
  '/repositories': 'Repositories',
  '/workflows': 'Workflows',
  '/runs': 'Workflow runs',
  '/commits': 'Commits',
  '/statistics': 'Thống kê'
};

export default function Header() {
  const { pathname } = useLocation();
  const { session, signOut } = useAuth();
  const [logoutError, setLogoutError] = useState('');
  const title = pathname.startsWith('/runs/') ? 'Chi tiết workflow run'
    : pathname.startsWith('/repositories/') ? 'Chi tiết repository'
      : pathname.startsWith('/workflows/') ? 'Chi tiết workflow'
        : titles[pathname] ?? 'GitHub Actions Monitor';
  async function handleSignOut() {
    setLogoutError('');
    try {
      await signOut();
    } catch (cause) {
      setLogoutError(cause.message);
    }
  }

  return <header className="topbar">
    <div><span className="breadcrumb"><Link to="/">Workspace</Link><span>/</span>{title}</span><h1>{title}</h1></div>
    <div className="topbar-actions">
      {session?.user && <span className="account-name">{session.user.name || session.user.login}</span>}
      <div className="topbar-meta"><span className="live-dot" />Monitoring</div>
      {session?.user && <button className="button secondary logout-button" onClick={handleSignOut}>Đăng xuất</button>}
      {logoutError && <span className="logout-error" role="alert">{logoutError}</span>}
    </div>
  </header>;
}
