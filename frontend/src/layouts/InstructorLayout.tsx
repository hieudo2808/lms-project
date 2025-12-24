import { Outlet, Navigate, useNavigate } from 'react-router-dom';
import { useQuery } from '@apollo/client';
import { InstructorSidebar } from '../components/instructor/InstructorSidebar';
import { Bell, Search, Loader2, LogOut } from 'lucide-react';
import { useAuthStore } from '../lib/store';
import { INSTRUCTOR_DASHBOARD_QUERY } from '../graphql/queries/dashboard';
import { client } from '../lib/apollo';

export const InstructorLayout = () => {
    const navigate = useNavigate();

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
        await client.clearStore(); // Clear Apollo cache
        logout(); // clear token + user
        navigate('/login'); // redirect
    };

    return (
        <div className="min-h-screen bg-gray-50 flex">
            {/* SIDEBAR */}
            <InstructorSidebar />

            <div className="flex-1 ml-64">
                {/* HEADER */}
                <header className="bg-white h-16 border-b border-gray-200 flex items-center justify-between px-8 sticky top-0 z-40 shadow-sm">
                    {/* Search */}
                    <div className="flex items-center bg-gray-100 rounded-full px-4 py-2 w-96 border border-transparent focus-within:border-blue-300 transition-all">
                        <Search className="w-4 h-4 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Tìm kiếm khóa học, bài học..."
                            className="bg-transparent border-none focus:outline-none text-sm ml-2 w-full text-gray-600 placeholder-gray-400"
                        />
                    </div>

                    {/* Right actions */}
                    <div className="flex items-center gap-6">
                        {/* Notification */}
                        <button className="relative p-2 rounded-full hover:bg-gray-100 transition-colors">
                            <Bell className="w-5 h-5 text-gray-600" />
                            <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white"></span>
                        </button>

                        {/* USER PROFILE + LOGOUT */}
                        <div className="relative group">
                            <div className="flex items-center gap-3 cursor-pointer">
                                <div className="relative">
                                    <img
                                        src={
                                            user?.avatarUrl ||
                                            `https://ui-avatars.com/api/?name=${encodeURIComponent(
                                                user?.fullName || 'U',
                                            )}&background=0D8ABC&color=fff`
                                        }
                                        alt="Avatar"
                                        className="w-9 h-9 rounded-full border border-gray-200 object-cover shadow-sm"
                                    />
                                    {loading && (
                                        <div className="absolute inset-0 flex items-center justify-center bg-white/60 rounded-full">
                                            <Loader2 className="w-4 h-4 animate-spin text-blue-600" />
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
                <main className="p-8">
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
