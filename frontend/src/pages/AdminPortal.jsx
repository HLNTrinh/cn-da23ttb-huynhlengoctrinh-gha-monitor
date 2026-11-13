import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Admin from './Admin.jsx';
import AdminLogin from './AdminLogin.jsx';
import { getAdminSession, logoutAdmin } from '../services/adminApi.js';
import { Loading } from '../components/PageState.jsx';

const adminNavigation = [
  { id: 'overview', label: 'Tổng quan' },
  { id: 'accounts', label: 'Tài khoản Admin' },
  { id: 'users', label: 'Người dùng GitHub' },
  { id: 'alerts', label: 'Cảnh báo' },
  { id: 'repositories', label: 'Repositories' },
  { id: 'activity', label: 'Nhật ký hoạt động' }
];

function AdminIcon({ id }) {
  const icon = {
    overview: <><rect x="3" y="3" width="7" height="7" rx="1.5" /><rect x="14" y="3" width="7" height="7" rx="1.5" /><rect x="14" y="14" width="7" height="7" rx="1.5" /><rect x="3" y="14" width="7" height="7" rx="1.5" /></>,
    accounts: <><circle cx="12" cy="8" r="4" /><path d="M5 21v-2a7 7 0 0 1 14 0v2" /></>,
    users: <><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" /></>,
    alerts: <><path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9" /><path d="M10 21h4" /></>,
    repositories: <><path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5Z" /><path d="M6 6h10M6 10h7" /></>,
    activity: <><path d="M3 3v18h18" /><path d="m19 9-5 5-4-4-5 5" /></>
  }[id];
  return <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">{icon}</svg>;
}

export default function AdminPortal() {
  const navigate = useNavigate();
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeSection, setActiveSection] = useState('overview');

  useEffect(() => {
    let active = true;
    getAdminSession()
      .then((result) => { if (active) setSession(result); })
      .catch((cause) => { if (active) setError(cause.message); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, []);

  if (loading) return <Loading />;
  if (error) return <main className="admin-login-page"><div className="notice error-notice" role="alert">{error}</div></main>;
  if (!session?.authenticated) {
    return <AdminLogin onSuccess={(result) => {
      setSession(result);
      navigate('/admin', { replace: true });
    }} />;
  }

  async function signOut() {
    await logoutAdmin();
    setSession({ authenticated: false, user: null });
  }

  const activeTitle = adminNavigation.find((item) => item.id === activeSection)?.label ?? 'Tổng quan';

  return (
    <div className="app-shell admin-shell">
      <aside className="sidebar admin-sidebar">
        <a href="/admin" className="brand">
          <span className="brand-mark">GH</span>
          <span>Actions<span className="brand-light"> Admin</span></span>
        </a>
        <p className="nav-caption">QUẢN TRỊ</p>
        <nav aria-label="Điều hướng quản trị">
          {adminNavigation.map((item) => (
            <button
              className={`nav-link${activeSection === item.id ? ' active' : ''}`}
              type="button"
              key={item.id}
              aria-current={activeSection === item.id ? 'page' : undefined}
              onClick={() => setActiveSection(item.id)}
            >
              <span className="nav-icon" aria-hidden="true"><AdminIcon id={item.id} /></span>
              <span className="nav-text">{item.label}</span>
            </button>
          ))}
        </nav>
        <div className="sidebar-footer">
          <strong>{session.user.email}</strong>
          <small>Đang đăng nhập quản trị</small>
        </div>
      </aside>
      <main className="main-area admin-main-area">
        <header className="topbar">
          <div>
            <span className="breadcrumb"><span>Admin</span><span>/</span>{activeTitle}</span>
            <h1>{activeTitle}</h1>
          </div>
          <div className="admin-portal-actions">
            <button className="button secondary button-sm" type="button" onClick={signOut}>Đăng xuất</button>
            <a className="button secondary button-sm" href="/login">Trang người dùng</a>
          </div>
        </header>
        <div className="page-content admin-portal-content">
          <Admin user={session.user} activeSection={activeSection} />
        </div>
      </main>
    </div>
  );
}
