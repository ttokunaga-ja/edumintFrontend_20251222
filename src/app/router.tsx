import { Routes, Route } from 'react-router-dom';
import { Suspense, lazy } from 'react';

// Lazy load pages to reduce initial bundle
const HomePage = lazy(() => import('../pages/HomePage'));
const LoginRegisterPage = lazy(() => import('../pages/LoginRegisterPage'));
const MyPage = lazy(() => import('../pages/MyPage'));
const AdminModerationPage = lazy(() => import('../pages/AdminModerationPage'));

// Fallback component
const PageLoader = () => <div>Loading...</div>;

export function Router() {
  return (
    <Suspense fallback={<PageLoader />}>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<LoginRegisterPage />} />
        <Route path="/register" element={<LoginRegisterPage mode="register" />} />
        <Route path="/mypage" element={<MyPage />} />
        <Route path="/admin" element={<AdminModerationPage />} />
        {/* Additional routes can be added here */}
      </Routes>
    </Suspense>
  );
}
