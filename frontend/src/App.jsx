import { BrowserRouter, Navigate, Outlet, Route, Routes } from 'react-router-dom';
import { AuthProvider, useAuth } from './auth/AuthContext.jsx';
import { ErrorState, Loading } from './components/PageState.jsx';
import MainLayout from './layouts/MainLayout.jsx';
import Commits from './pages/Commits.jsx';
import Dashboard from './pages/Dashboard.jsx';
import Login from './pages/Login.jsx';
import Repositories from './pages/Repositories.jsx';
import RepositoryDetail from './pages/RepositoryDetail.jsx';
import RunDetail from './pages/RunDetail.jsx';
import Statistics from './pages/Statistics.jsx';
import WorkflowDetail from './pages/WorkflowDetail.jsx';
import WorkflowRuns from './pages/WorkflowRuns.jsx';
import Workflows from './pages/Workflows.jsx';

function ProtectedLayout() {
  const { session, error } = useAuth();
  if (error) return <ErrorState message={error} />;
  if (!session) return <Loading />;
  if (session.enabled && !session.authenticated) return <Navigate to="/login" replace />;
  return <Outlet />;
}

function LoginRoute() {
  const { session, error } = useAuth();
  if (error) return <ErrorState message={error} />;
  if (!session) return <Loading />;
  if (!session.enabled) return <Navigate to="/" replace />;
  if (session.authenticated) return <Navigate to="/" replace />;
  return <Login configuration={session} />;
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="login" element={<LoginRoute />} />
          <Route element={<ProtectedLayout />}>
            <Route element={<MainLayout />}>
              <Route index element={<Dashboard />} />
              <Route path="repositories" element={<Repositories />} />
              <Route path="repositories/:fullName" element={<RepositoryDetail />} />
              <Route path="workflows" element={<Workflows />} />
              <Route path="workflows/:id" element={<WorkflowDetail />} />
              <Route path="runs" element={<WorkflowRuns />} />
              <Route path="runs/:id" element={<RunDetail />} />
              <Route path="statistics" element={<Statistics />} />
              <Route path="commits" element={<Commits />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Route>
          </Route>
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}
