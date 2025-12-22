import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuthStore } from '../../lib/store';

export const ProtectedRoute = () => {
  const { user } = useAuthStore();
  const location = useLocation();

  // Nếu chưa đăng nhập -> Đá về trang Login
  if (!user) {
    // state={{ from: location }} giúp login xong tự quay lại trang này
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Nếu đã đăng nhập -> Cho đi tiếp
  return <Outlet />;
};