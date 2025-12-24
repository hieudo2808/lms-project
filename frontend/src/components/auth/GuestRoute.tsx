import { Navigate, Outlet } from 'react-router-dom';
import { useAuthStore } from '../../lib/store';

export const GuestRoute = () => {
    const { token, user, _hasHydrated } = useAuthStore();

    if (!_hasHydrated) {
        return null;
    }

    const isAuthenticated = !!token && !!user;

    if (isAuthenticated) {
        const role = user.roleName;
        if (role === 'ADMIN') {
            return <Navigate to="/admin/dashboard" replace />;
        } else if (role === 'INSTRUCTOR') {
            return <Navigate to="/instructor/dashboard" replace />;
        } else {
            return <Navigate to="/dashboard/my-courses" replace />;
        }
    }

    return <Outlet />;
};
