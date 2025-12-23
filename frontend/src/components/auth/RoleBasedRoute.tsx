import { Navigate, Outlet } from 'react-router-dom';
import { useAuthStore } from '../../lib/store';

type Role = 'STUDENT' | 'INSTRUCTOR' | 'ADMIN';

interface RoleBasedRouteProps {
    allowedRoles: Role[];
    fallbackPath?: string;
}

export const RoleBasedRoute = ({ allowedRoles, fallbackPath = '/' }: RoleBasedRouteProps) => {
    const { user, _hasHydrated } = useAuthStore();

    // Chờ Zustand rehydrate xong từ localStorage
    if (!_hasHydrated) {
        return null; // hoặc Loading spinner
    }

    const userRole = user?.roleName as Role | undefined;

    if (!userRole || !allowedRoles.includes(userRole)) {
        return <Navigate to={fallbackPath} replace />;
    }

    return <Outlet />;
};
