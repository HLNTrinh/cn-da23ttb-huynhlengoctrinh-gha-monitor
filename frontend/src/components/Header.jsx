import { Link, useLocation } from 'react-router-dom';

const titles = {
  '/': 'Tổng quan',
  '/repositories': 'Repositories',
  '/workflows': 'Workflows',
  '/runs': 'Workflow runs',
  '/statistics': 'Thống kê'
};

export default function Header() {
  const { pathname } = useLocation();
  const title = pathname.startsWith('/runs/') ? 'Chi tiết workflow run'
    : pathname.startsWith('/repositories/') ? 'Chi tiết repository'
      : pathname.startsWith('/workflows/') ? 'Chi tiết workflow'
        : titles[pathname] ?? 'GitHub Actions Monitor';
  return <header className="topbar"><div><span className="breadcrumb"><Link to="/">Workspace</Link><span>/</span>{title}</span><h1>{title}</h1></div><div className="topbar-meta"><span className="live-dot" />Monitoring</div></header>;
}
