import { NavLink } from 'react-router-dom';

const links = [
  ['/', 'Tổng quan'],
  ['/repositories', 'Repositories'],
  ['/workflows', 'Workflows'],
  ['/runs', 'Workflow runs'],
  ['/statistics', 'Thống kê']
];

export default function Sidebar() {
  return (
    <aside className="sidebar">
      <NavLink to="/" className="brand"><span className="brand-mark">GH</span><span>Actions<span className="brand-light"> Monitor</span></span></NavLink>
      <p className="nav-caption">WORKSPACE</p>
      <nav>{links.map(([to, label]) => <NavLink key={to} to={to} end={to === '/'} className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}><span className="nav-dot" />{label}</NavLink>)}</nav>
      <div className="sidebar-footer"><span className="live-dot" /> Live monitoring<br /><small>GitHub Actions dashboard</small></div>
    </aside>
  );
}
