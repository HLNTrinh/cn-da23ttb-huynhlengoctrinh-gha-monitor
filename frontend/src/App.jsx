import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import MainLayout from './layouts/MainLayout.jsx';
import Dashboard from './pages/Dashboard.jsx';
import Repositories from './pages/Repositories.jsx';
import RepositoryDetail from './pages/RepositoryDetail.jsx';
import Workflows from './pages/Workflows.jsx';
import WorkflowDetail from './pages/WorkflowDetail.jsx';
import WorkflowRuns from './pages/WorkflowRuns.jsx';
import RunDetail from './pages/RunDetail.jsx';
import Statistics from './pages/Statistics.jsx';

export default function App() {
  return <BrowserRouter><Routes><Route element={<MainLayout />}>
    <Route index element={<Dashboard />} />
    <Route path="repositories" element={<Repositories />} />
    <Route path="repositories/:fullName" element={<RepositoryDetail />} />
    <Route path="workflows" element={<Workflows />} />
    <Route path="workflows/:id" element={<WorkflowDetail />} />
    <Route path="runs" element={<WorkflowRuns />} />
    <Route path="runs/:id" element={<RunDetail />} />
    <Route path="statistics" element={<Statistics />} />
    <Route path="*" element={<Navigate to="/" replace />} />
  </Route></Routes></BrowserRouter>;
}
