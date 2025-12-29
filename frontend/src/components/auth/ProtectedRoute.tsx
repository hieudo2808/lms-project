import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuthStore } from '../../lib/store';

export const ProtectedRoute = () => {
    const { token, _hasHydrated } = useAuthStore();
    const location = useLocation();

    if (!_hasHydrated) {
        return null;
    }

    const isAuthenticated = !!token;

    if (!isAuthenticated) {
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    return <Outlet />;
};
