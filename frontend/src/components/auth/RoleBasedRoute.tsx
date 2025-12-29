import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuthStore } from '../../lib/store';

type Role = 'STUDENT' | 'INSTRUCTOR' | 'ADMIN';

interface RoleBasedRouteProps {
    allowedRoles: Role[];
    fallbackPath?: string;
}

export const RoleBasedRoute = ({ allowedRoles, fallbackPath = '/' }: RoleBasedRouteProps) => {
    const { user, token, _hasHydrated } = useAuthStore();
    const location = useLocation();

    if (!_hasHydrated) {
        return null;
    }

    const userRole = user?.roleName as Role | undefined;

    if (!token) {
        return <Outlet />;
    }

    if (!userRole || !allowedRoles.includes(userRole)) {
        return <Navigate to={fallbackPath} replace state={{ from: location }} />;
    }

    return <Outlet />;
};
