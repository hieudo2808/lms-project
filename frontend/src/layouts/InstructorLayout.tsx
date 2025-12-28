import { Outlet, Navigate, useNavigate } from 'react-router-dom';
import { useQuery } from '@apollo/client';
import { InstructorSidebar } from '../components/instructor/InstructorSidebar';
import { Bell, Loader2, LogOut, Menu } from 'lucide-react';
import { useAuthStore } from '../lib/store';
import { INSTRUCTOR_DASHBOARD_QUERY } from '../graphql/queries/dashboard';
import { client } from '../lib/apollo';
import { useState } from 'react';

export const InstructorLayout = () => {
    const navigate = useNavigate();
    const [sidebarOpen, setSidebarOpen] = useState(false);

    // ===== AUTH STORE =====
    const { token, user: storeUser, logout } = useAuthStore();

    // ===== FETCH USER FROM BACKEND =====
    const { data, loading, error } = useQuery(INSTRUCTOR_DASHBOARD_QUERY, {
        fetchPolicy: 'cache-and-network',
        skip: !token,
    });

    // ===== ROUTE GUARD =====
    if (!token) {
        return <Navigate to="/login" replace />;
    }

    // Ưu tiên dữ liệu backend
    const user = data?.me || storeUser;

    // ===== LOGOUT HANDLER =====
    const handleLogout = async () => {
        try {
            await client.clearStore();
            await client.resetStore();
            logout();
            navigate('/login', { replace: true });
        } catch (error) {
            console.error('Logout error:', error);
            logout();
            navigate('/login', { replace: true });
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 flex overflow-x-hidden">
            {/* SIDEBAR */}
            <InstructorSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

            <div className="flex-1 lg:ml-64 w-full min-w-0">
                {/* HEADER */}
                <header className="bg-white h-14 sm:h-16 border-b border-gray-200 flex items-center justify-between px-4 sm:px-6 lg:px-8 sticky top-0 z-40 shadow-sm">
                    {/* Hamburger Menu for mobile */}
                    <button
                        onClick={() => setSidebarOpen(true)}
                        className="lg:hidden p-2 rounded-lg hover:bg-gray-100 text-gray-600"
                    >
                        <Menu className="w-5 h-5" />
                    </button>

                    {/* Right actions */}
                    <div className="flex items-center gap-3 sm:gap-6 ml-auto">
                        {/* Notification */}
                        <button className="relative p-2 rounded-full hover:bg-gray-100 transition-colors">
                            <Bell className="w-4 h-4 sm:w-5 sm:h-5 text-gray-600" />
                            <span className="absolute top-1 right-1 w-2 h-2 sm:w-2.5 sm:h-2.5 bg-red-500 rounded-full border-2 border-white"></span>
                        </button>

                        {/* USER PROFILE + LOGOUT */}
                        <div className="relative group">
                            <div className="flex items-center gap-2 sm:gap-3 cursor-pointer">
                                <div className="relative">
                                    <img
                                        src={
                                            user?.avatarUrl ||
                                            `https://ui-avatars.com/api/?name=${encodeURIComponent(
                                                user?.fullName || 'U',
                                            )}&background=0D8ABC&color=fff`
                                        }
                                        alt="Avatar"
                                        className="w-8 h-8 sm:w-9 sm:h-9 rounded-full border border-gray-200 object-cover shadow-sm"
                                    />
                                    {loading && (
                                        <div className="absolute inset-0 flex items-center justify-center bg-white/60 rounded-full">
                                            <Loader2 className="w-3 h-3 sm:w-4 sm:h-4 animate-spin text-blue-600" />
                                        </div>
                                    )}
                                </div>

                                <div className="hidden md:block text-left">
                                    <p className="text-sm font-bold text-gray-700">{user?.fullName || 'Đang tải...'}</p>
                                    <p className="text-[10px] uppercase tracking-wider font-black text-blue-500">
                                        {user?.roleName === 'INSTRUCTOR' ? 'Giảng viên' : user?.roleName}
                                    </p>
                                </div>
                            </div>

                            {/* DROPDOWN */}
                            <div className="absolute right-0 mt-3 w-44 bg-white border rounded-xl shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all">
                                <button
                                    onClick={handleLogout}
                                    className="w-full flex items-center gap-2 px-4 py-3 text-sm text-red-600 hover:bg-red-50 rounded-xl"
                                >
                                    <LogOut className="w-4 h-4" />
                                    Đăng xuất
                                </button>
                            </div>
                        </div>
                    </div>
                </header>

                {/* CONTENT */}
                <main className="p-4 sm:p-6 lg:p-8 w-full overflow-x-hidden min-w-0">
                    {error && (
                        <div className="mb-4 p-4 bg-red-50 border border-red-200 text-red-600 rounded-lg text-sm">
                            Phiên làm việc hết hạn hoặc lỗi kết nối. Vui lòng đăng nhập lại.
                        </div>
                    )}
                    <Outlet />
                </main>
            </div>
        </div>
    );
};
