import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuthStore } from "../../lib/store";

export const ProtectedRoute = () => {
  const { token } = useAuthStore();
  const location = useLocation();

  // Zustand persist rehydrate nhanh, không cần isLoading riêng
  const isAuthenticated = !!token;

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <Outlet />;
};
