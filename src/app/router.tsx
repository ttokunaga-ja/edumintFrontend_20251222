import { Routes, Route } from 'react-router-dom';
import { Suspense, lazy } from 'react';
import { ProtectedRoute, AdminRoute } from './ProtectedRoute';

// Lazy load pages to reduce initial bundle
const HomePage = lazy(() => import('../pages/HomePage'));
const LoginRegisterPage = lazy(() => import('../pages/LoginRegisterPage'));
const MyPage = lazy(() => import('../pages/MyPage'));
const AdminModerationPage = lazy(() => import('../pages/AdminModerationPage'));
const ProblemCreatePage = lazy(() => import('../pages/ProblemCreatePage'));
const ExamPage = lazy(() => import('../pages/ExamPage'));

// Fallback component
const PageLoader = () => <div>Loading...</div>;

export function Router() {
  return (
    <Suspense fallback={<PageLoader />}>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<LoginRegisterPage />} />
        <Route path="/register" element={<LoginRegisterPage mode="register" />} />

        {/* Protected Routes */}
        <Route
          path="/create"
          element={
            <ProtectedRoute>
              <ProblemCreatePage />
            </ProtectedRoute>
          }
        />
        <Route path="/exam/:id/:slug?" element={<ExamPage />} />
        <Route
          path="/mypage"
          element={
            <ProtectedRoute>
              <MyPage />
            </ProtectedRoute>
          }
        />

        {/* Admin Routes */}
        <Route
          path="/admin"
          element={
            <AdminRoute>
              <AdminModerationPage />
            </AdminRoute>
          }
        />

        {/* Additional routes can be added here */}
      </Routes>
    </Suspense>
  );
}
