import { Navigate } from 'react-router-dom';
import { useAuth } from '@/features/auth/hooks/useAuth';

interface ProtectedRouteProps {
  children: ReactNode;
}

/**
 * ProtectedRoute Component
 * 認証が必要なページをガード
 * 未ログインユーザーは /login にリダイレクト
 */
export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}

/**
 * AdminRoute Component
 * 管理者のみアクセス可能
 * 権限不足は /login にリダイレクト
 */
export function AdminRoute({ children }: ProtectedRouteProps) {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (!user || user.role !== 'admin') {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}

export default ProtectedRoute;
