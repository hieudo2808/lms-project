import { Outlet, Navigate, useNavigate } from 'react-router-dom';
import { useQuery } from '@apollo/client';
import { AdminSidebar } from '../components/admin/AdminSidebar';
import { Bell, Loader2, LogOut, Menu } from 'lucide-react';
import { useAuthStore } from '../lib/store';
import { GET_SYSTEM_STATISTICS } from '../graphql/queries/admin';
import { client } from '../lib/apollo';
import { useState } from 'react';

export const AdminLayout = () => {
    const navigate = useNavigate();
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const { token, user: storeUser, logout } = useAuthStore();

    const { loading, error } = useQuery(GET_SYSTEM_STATISTICS, {
        fetchPolicy: 'cache-and-network',
        skip: !token,
    });

    if (!token) {
        return <Navigate to="/login" replace />;
    }

    const user = storeUser;

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
            <AdminSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

            <div className="flex-1 lg:ml-64 w-full min-w-0">
                <header className="bg-white h-14 sm:h-16 border-b border-gray-200 flex items-center justify-between px-4 sm:px-6 lg:px-8 sticky top-0 z-40 shadow-sm">
                    <button
                        onClick={() => setSidebarOpen(true)}
                        className="lg:hidden p-2 rounded-lg hover:bg-gray-100 text-gray-600"
                    >
                        <Menu className="w-5 h-5" />
                    </button>

                    <div className="flex items-center gap-3 sm:gap-6 ml-auto">
                        <button className="relative p-2 rounded-full hover:bg-gray-100 transition-colors">
                            <Bell className="w-4 h-4 sm:w-5 sm:h-5 text-gray-600" />
                            <span className="absolute top-1 right-1 w-2 h-2 sm:w-2.5 sm:h-2.5 bg-red-500 rounded-full border-2 border-white"></span>
                        </button>

                        <div className="relative group">
                            <div className="flex items-center gap-2 sm:gap-3 cursor-pointer">
                                <div className="relative">
                                    <img
                                        src={
                                            user?.avatarUrl ||
                                            `https:
                                                user?.fullName || 'Admin',
                                            )}&background=DC2626&color=fff`
                                        }
                                        alt="Avatar"
                                        className="w-8 h-8 sm:w-9 sm:h-9 rounded-full border border-gray-200 object-cover shadow-sm"
                                    />
                                    {loading && (
                                        <div className="absolute inset-0 flex items-center justify-center bg-white/60 rounded-full">
                                            <Loader2 className="w-3 h-3 sm:w-4 sm:h-4 animate-spin text-red-600" />
                                        </div>
                                    )}
                                </div>

                                <div className="hidden md:block text-left">
                                    <p className="text-sm font-bold text-gray-700">{user?.fullName || 'Đang tải...'}</p>
                                    <p className="text-[10px] uppercase tracking-wider font-black text-red-500">
                                        ADMIN
                                    </p>
                                </div>
                            </div>

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

                <main className="p-4 sm:p-6 lg:p-8 w-full overflow-x-hidden min-w-0">
                    {error && (
                        <div className="mb-4 p-4 bg-red-50 border border-red-200 text-red-600 rounded-lg text-sm">
                            Lỗi kết nối. Vui lòng thử lại.
                        </div>
                    )}
                    <Outlet />
                </main>
            </div>
        </div>
    );
};
