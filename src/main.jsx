import { StrictMode, lazy, Suspense } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import { LoadingSpinner } from './components/LoadingSpinner';
import './index.css';

const Login = lazy(() => import('./pages/Login'));
const Dashboard = lazy(() => import('./pages/Dashboard'));
const TaskBoard = lazy(() => import('./pages/tasks/TaskBoard'));
const TaskDetail = lazy(() => import('./pages/tasks/TaskDetail'));
const DeviceList = lazy(() => import('./pages/devops/DeviceList'));
const DeviceDetail = lazy(() => import('./pages/devops/DeviceDetail'));
const MintDevice = lazy(() => import('./pages/devops/MintDevice'));
const Permissions = lazy(() => import('./pages/Permissions'));

const Fallback = () => (
  <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
    <LoadingSpinner size={32} />
  </div>
);

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <Suspense fallback={<Fallback />}>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route element={<ProtectedRoute />}>
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/tasks/:teamSlug" element={<TaskBoard />} />
              <Route path="/tasks/:teamSlug/:taskId" element={<TaskDetail />} />
              <Route path="/devops" element={<DeviceList />} />
              <Route path="/devops/mint" element={<MintDevice />} />
              <Route path="/devops/:deviceId" element={<DeviceDetail />} />
              <Route path="/admin/permissions" element={<Permissions />} />
            </Route>
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </Suspense>
      </AuthProvider>
    </BrowserRouter>
  </StrictMode>
);
