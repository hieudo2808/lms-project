import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuthStore } from '../../lib/store';

interface RoleRouteProps {
  allowedRoles: string[]; // Danh sách các quyền được phép (vd: ['INSTRUCTOR', 'ADMIN'])
}

export const RoleRoute = ({ allowedRoles }: RoleRouteProps) => {
  const { user } = useAuthStore();
  const location = useLocation();

  // 1. Chưa đăng nhập -> Về Login
  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // 2. Đã đăng nhập nhưng sai quyền -> Về trang chủ (hoặc trang 403)
  // Lưu ý: user.roleName phải khớp với chuỗi bạn truyền trong App.tsx
  if (!allowedRoles.includes(user.roleName)) {
    return <Navigate to="/" replace />;
  }

  // 3. Đúng quyền -> Cho đi tiếp
  return <Outlet />;
};