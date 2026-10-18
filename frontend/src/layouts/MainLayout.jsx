import { Outlet } from 'react-router-dom';
import Header from '../components/Header.jsx';
import Sidebar from '../components/Sidebar.jsx';

export default function MainLayout() {
  return <div className="app-shell"><Sidebar /><main className="main-area"><Header /><div className="page-content"><Outlet /></div></main></div>;
}
