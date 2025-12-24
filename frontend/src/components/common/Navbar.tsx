import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { useQuery } from '@apollo/client';
import { useAuthStore } from '../../lib/store';
import { GET_ME_QUERY } from '../../graphql/queries/user';
import { client } from '../../lib/apollo';

export const Navbar = () => {
    const { user: storedUser, token, logout, setAuth } = useAuthStore();
    const location = useLocation();

    const isAuthPage = ['/login', '/register'].includes(location.pathname);

    // Query GET_ME để lấy user data mới nhất (bao gồm avatar)
    const { data: meData } = useQuery(GET_ME_QUERY, {
        skip: !token || isAuthPage, // Chỉ query khi đã login
        fetchPolicy: 'cache-and-network', // Luôn fetch để có data mới nhất
    });

    // Sync user data từ GET_ME vào store
    useEffect(() => {
        if (meData?.me && token) {
            setAuth(token, meData.me);
        }
    }, [meData, token, setAuth]);

    const user = meData?.me || storedUser;
    const navigate = useNavigate();
    const isAuthenticated = !!token;
    const [showExploreMenu, setShowExploreMenu] = useState(false);
    const [showUserMenu, setShowUserMenu] = useState(false);

    const handleLogout = async () => {
        await client.clearStore(); // Clear Apollo cache
        logout();
        navigate('/login');
    };

    const handleExplore = (level?: string) => {
        setShowExploreMenu(false);
        if (level) {
            // Capitalize first letter to match backend format
            const capitalizedLevel = level.charAt(0).toUpperCase() + level.slice(1);
            navigate(`/courses?level=${capitalizedLevel}`);
        } else {
            navigate('/courses');
        }
    };

    return (
        <nav className="bg-white shadow-lg sticky top-0 z-50">
            <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
                {/* Logo */}
                <Link to="/" className="flex items-center gap-2">
                    <div className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                        🎓 LMS
                    </div>
                    <span className="text-xs font-semibold text-gray-600 uppercase tracking-wider">Platform</span>
                </Link>

                {/* Navigation Links */}
                <div className="flex items-center gap-8">
                    {/* Explore Dropdown */}
                    <div className="relative group">
                        <button
                            onClick={() => setShowExploreMenu(!showExploreMenu)}
                            className="text-gray-700 hover:text-blue-600 font-medium transition-colors flex items-center gap-2"
                        >
                            🔍 Khám phá
                            <span className={`text-sm transition-transform ${showExploreMenu ? 'rotate-180' : ''}`}>
                                ▼
                            </span>
                        </button>

                        {/* Dropdown Menu */}
                        {showExploreMenu && (
                            <div className="absolute top-full left-0 mt-2 w-48 bg-white border border-gray-200 rounded-lg shadow-lg overflow-hidden">
                                <button
                                    onClick={() => handleExplore()}
                                    className="w-full text-left px-4 py-3 hover:bg-blue-50 text-gray-700 font-medium transition-colors border-b border-gray-100"
                                >
                                    📚 Tất cả khóa học
                                </button>
                                <button
                                    onClick={() => handleExplore('beginner')}
                                    className="w-full text-left px-4 py-3 hover:bg-green-50 text-gray-700 font-medium transition-colors border-b border-gray-100"
                                >
                                    🌱 Cơ bản
                                </button>
                                <button
                                    onClick={() => handleExplore('intermediate')}
                                    className="w-full text-left px-4 py-3 hover:bg-yellow-50 text-gray-700 font-medium transition-colors border-b border-gray-100"
                                >
                                    📈 Trung bình
                                </button>
                                <button
                                    onClick={() => handleExplore('advanced')}
                                    className="w-full text-left px-4 py-3 hover:bg-purple-50 text-gray-700 font-medium transition-colors"
                                >
                                    🚀 Nâng cao
                                </button>
                            </div>
                        )}
                    </div>

                    {isAuthenticated && (
                        <>
                            <Link
                                to="/dashboard/my-courses"
                                className="text-gray-700 hover:text-blue-600 font-medium transition-colors"
                            >
                                📖 Khóa học của tôi
                            </Link>
                            <Link
                                to="/dashboard/certificates"
                                className="text-gray-700 hover:text-blue-600 font-medium transition-colors"
                            >
                                🏆 Chứng chỉ
                            </Link>
                        </>
                    )}

                    {/* Auth Section */}
                    {isAuthenticated ? (
                        <div className="relative pl-4 border-l border-gray-200">
                            <button
                                onClick={() => setShowUserMenu(!showUserMenu)}
                                className="flex items-center gap-2 hover:opacity-80 transition-opacity"
                            >
                                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white font-bold text-sm">
                                    {user?.fullName?.[0] || 'U'}
                                </div>
                                <span className="text-sm font-medium text-gray-700">
                                    {user?.fullName?.split(' ')[0] || 'User'}
                                </span>
                                <span className={`text-sm transition-transform ${showUserMenu ? 'rotate-180' : ''}`}>
                                    ▼
                                </span>
                            </button>

                            {/* User Dropdown Menu */}
                            {showUserMenu && (
                                <div className="absolute top-full right-0 mt-2 w-56 bg-white border border-gray-200 rounded-lg shadow-lg overflow-hidden">
                                    <div className="px-4 py-3 border-b border-gray-100 bg-gray-50">
                                        <p className="text-sm font-semibold text-gray-900">{user?.fullName}</p>
                                        <p className="text-xs text-gray-500">{user?.email}</p>
                                    </div>
                                    <Link
                                        to="/dashboard/settings"
                                        onClick={() => setShowUserMenu(false)}
                                        className="block px-4 py-3 hover:bg-blue-50 text-gray-700 font-medium transition-colors border-b border-gray-100"
                                    >
                                        ⚙️ Cài đặt tài khoản
                                    </Link>
                                    <button
                                        onClick={() => {
                                            setShowUserMenu(false);
                                            handleLogout();
                                        }}
                                        className="w-full text-left px-4 py-3 hover:bg-red-50 text-red-600 font-medium transition-colors"
                                    >
                                        🚪 Đăng xuất
                                    </button>
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="flex items-center gap-3">
                            <Link
                                to="/login"
                                className="text-gray-700 hover:text-blue-600 font-medium transition-colors"
                            >
                                🔑 Đăng nhập
                            </Link>
                            <Link
                                to="/register"
                                className="px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg font-medium hover:shadow-lg transition-all"
                            >
                                ✨ Đăng ký
                            </Link>
                        </div>
                    )}
                </div>
            </div>
        </nav>
    );
};
