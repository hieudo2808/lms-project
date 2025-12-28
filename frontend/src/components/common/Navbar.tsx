import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useState, useEffect, useRef } from 'react';
import { useQuery } from '@apollo/client';
import { useAuthStore } from '../../lib/store';
import { GET_ME_QUERY } from '../../graphql/queries/user';
import { client } from '../../lib/apollo';

export const Navbar = () => {
    const { user: storedUser, token, logout, setAuth, _hasHydrated } = useAuthStore();
    const location = useLocation();
    const navigate = useNavigate();

    const isAuthPage = ['/login', '/register'].includes(location.pathname);

    const { data: meData } = useQuery(GET_ME_QUERY, {
        skip: !_hasHydrated || !token || isAuthPage,
        fetchPolicy: 'cache-and-network',
    });

    useEffect(() => {
        if (meData?.me && token) {
            setAuth(token, meData.me);
        }
    }, [meData, token, setAuth]);

    const user = meData?.me || storedUser;
    const isAuthenticated = _hasHydrated && !!token;

    const [showExploreMenu, setShowExploreMenu] = useState(false);
    const [showUserMenu, setShowUserMenu] = useState(false);
    const [showMobileMenu, setShowMobileMenu] = useState(false);

    const exploreMenuRef = useRef<HTMLDivElement>(null);
    const userMenuRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (exploreMenuRef.current && !exploreMenuRef.current.contains(event.target as Node)) {
                setShowExploreMenu(false);
            }
            if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
                setShowUserMenu(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    if (!_hasHydrated) {
        return (
            <nav className="bg-white shadow-lg sticky top-0 z-50">
                <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
                    <Link to="/" className="flex items-center gap-2">
                        <div className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                            EduNova
                        </div>
                    </Link>
                    <div className="w-32 h-8 bg-gray-200 animate-pulse rounded"></div>
                </div>
            </nav>
        );
    }

    const handleLogout = async () => {
        try {
            if (typeof window !== 'undefined' && (window as any).google?.accounts?.id) {
                try {
                    (window as any).google.accounts.id.disableAutoSelect();
                    (window as any).google.accounts.id.revoke(user?.email || '', () => {});
                } catch (e) {}
            }

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

    const handleExplore = (level?: string) => {
        setShowExploreMenu(false);
        if (level) {
            const capitalizedLevel = level.charAt(0).toUpperCase() + level.slice(1);
            navigate(`/courses?level=${capitalizedLevel}`);
        } else {
            navigate('/courses');
        }
    };

    return (
        <nav className="bg-white shadow-lg sticky top-0 z-50 w-full">
            <div className="max-w-7xl mx-auto px-4 py-3 w-full">
                <div className="flex items-center justify-between gap-2 sm:gap-4 min-w-0">
                    {/* Logo */}
                    <Link to="/" className="flex items-center gap-2">
                        <div className="text-xl md:text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                            EduNova
                        </div>
                    </Link>

                    {/* Desktop Navigation */}
                    <div className="hidden lg:flex items-center gap-6 xl:gap-8 min-w-0">
                        {/* Explore Dropdown */}
                        <div className="relative" ref={exploreMenuRef}>
                            <button
                                onClick={() => setShowExploreMenu(!showExploreMenu)}
                                className="text-gray-700 hover:text-blue-600 font-medium transition-colors flex items-center gap-2 whitespace-nowrap"
                            >
                                Khám phá
                                <span className={`text-sm transition-transform ${showExploreMenu ? 'rotate-180' : ''}`}>
                                    ▼
                                </span>
                            </button>

                            {showExploreMenu && (
                                <div className="absolute top-full left-0 mt-2 w-48 bg-white border border-gray-200 rounded-lg shadow-xl overflow-hidden z-[100]">
                                    <button
                                        onClick={() => handleExplore()}
                                        className="w-full text-left px-4 py-3 hover:bg-blue-50 text-gray-700 font-medium transition-colors border-b border-gray-100"
                                    >
                                        Tất cả khóa học
                                    </button>
                                    <button
                                        onClick={() => handleExplore('beginner')}
                                        className="w-full text-left px-4 py-3 hover:bg-green-50 text-gray-700 font-medium transition-colors border-b border-gray-100"
                                    >
                                        Cơ bản
                                    </button>
                                    <button
                                        onClick={() => handleExplore('intermediate')}
                                        className="w-full text-left px-4 py-3 hover:bg-yellow-50 text-gray-700 font-medium transition-colors border-b border-gray-100"
                                    >
                                        Trung bình
                                    </button>
                                    <button
                                        onClick={() => handleExplore('advanced')}
                                        className="w-full text-left px-4 py-3 hover:bg-purple-50 text-gray-700 font-medium transition-colors"
                                    >
                                        Nâng cao
                                    </button>
                                </div>
                            )}
                        </div>

                        {isAuthenticated && (
                            <>
                                <Link
                                    to="/dashboard/my-courses"
                                    className="text-gray-700 hover:text-blue-600 font-medium transition-colors whitespace-nowrap"
                                >
                                    Khóa học của tôi
                                </Link>
                                <Link
                                    to="/dashboard/certificates"
                                    className="text-gray-700 hover:text-blue-600 font-medium transition-colors whitespace-nowrap"
                                >
                                    Chứng chỉ
                                </Link>
                            </>
                        )}

                        {/* Auth Section */}
                        {isAuthenticated ? (
                            <div className="relative pl-4 border-l border-gray-200" ref={userMenuRef}>
                                <button
                                    onClick={() => setShowUserMenu(!showUserMenu)}
                                    className="flex items-center gap-2 hover:opacity-80 transition-opacity whitespace-nowrap"
                                >
                                    {user?.avatarUrl ? (
                                        <img
                                            src={user.avatarUrl}
                                            alt={user.fullName}
                                            className="w-8 h-8 rounded-full object-cover border-2 border-blue-500"
                                        />
                                    ) : (
                                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white font-bold text-sm">
                                            {user?.fullName?.[0] || 'U'}
                                        </div>
                                    )}
                                    <span className="text-sm font-medium text-gray-700 hidden xl:inline">
                                        {user?.fullName?.split(' ')[0] || 'User'}
                                    </span>
                                    <span
                                        className={`text-sm transition-transform ${showUserMenu ? 'rotate-180' : ''}`}
                                    >
                                        ▼
                                    </span>
                                </button>

                                {showUserMenu && (
                                    <div className="absolute top-full right-0 mt-2 w-56 bg-white border border-gray-200 rounded-lg shadow-xl overflow-hidden z-[100]">
                                        <div className="px-4 py-3 border-b border-gray-100 bg-gray-50">
                                            <p className="text-sm font-semibold text-gray-900">{user?.fullName}</p>
                                            <p className="text-xs text-gray-500">{user?.email}</p>
                                        </div>
                                        <Link
                                            to="/dashboard/settings"
                                            onClick={() => setShowUserMenu(false)}
                                            className="block px-4 py-3 hover:bg-blue-50 text-gray-700 font-medium transition-colors border-b border-gray-100"
                                        >
                                            Cài đặt tài khoản
                                        </Link>
                                        <button
                                            onClick={() => {
                                                setShowUserMenu(false);
                                                handleLogout();
                                            }}
                                            className="w-full text-left px-4 py-3 hover:bg-red-50 text-red-600 font-medium transition-colors"
                                        >
                                            Đăng xuất
                                        </button>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div className="flex items-center gap-3">
                                <Link
                                    to="/login"
                                    className="text-gray-700 hover:text-blue-600 font-medium transition-colors whitespace-nowrap"
                                >
                                    Đăng nhập
                                </Link>
                                <Link
                                    to="/register"
                                    className="px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg font-medium hover:shadow-lg transition-all whitespace-nowrap"
                                >
                                    Đăng ký
                                </Link>
                            </div>
                        )}
                    </div>

                    {/* Mobile Menu Button */}
                    <button
                        onClick={() => setShowMobileMenu(!showMobileMenu)}
                        className="lg:hidden p-2 text-gray-700 hover:text-blue-600"
                    >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            {showMobileMenu ? (
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M6 18L18 6M6 6l12 12"
                                />
                            ) : (
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M4 6h16M4 12h16M4 18h16"
                                />
                            )}
                        </svg>
                    </button>
                </div>

                {/* Mobile Navigation */}
                {showMobileMenu && (
                    <div className="lg:hidden mt-4 pt-4 border-t border-gray-200">
                        <div className="space-y-2">
                            <button
                                onClick={() => {
                                    handleExplore();
                                    setShowMobileMenu(false);
                                }}
                                className="w-full text-left px-4 py-2 text-gray-700 hover:bg-blue-50 rounded-lg font-medium"
                            >
                                Tất cả khóa học
                            </button>
                            <button
                                onClick={() => {
                                    handleExplore('beginner');
                                    setShowMobileMenu(false);
                                }}
                                className="w-full text-left px-4 py-2 text-gray-700 hover:bg-green-50 rounded-lg font-medium"
                            >
                                Cơ bản
                            </button>
                            <button
                                onClick={() => {
                                    handleExplore('intermediate');
                                    setShowMobileMenu(false);
                                }}
                                className="w-full text-left px-4 py-2 text-gray-700 hover:bg-yellow-50 rounded-lg font-medium"
                            >
                                Trung bình
                            </button>
                            <button
                                onClick={() => {
                                    handleExplore('advanced');
                                    setShowMobileMenu(false);
                                }}
                                className="w-full text-left px-4 py-2 text-gray-700 hover:bg-purple-50 rounded-lg font-medium"
                            >
                                Nâng cao
                            </button>

                            {isAuthenticated && (
                                <>
                                    <Link
                                        to="/dashboard/my-courses"
                                        onClick={() => setShowMobileMenu(false)}
                                        className="block px-4 py-2 text-gray-700 hover:bg-blue-50 rounded-lg font-medium"
                                    >
                                        Khóa học của tôi
                                    </Link>
                                    <Link
                                        to="/dashboard/certificates"
                                        onClick={() => setShowMobileMenu(false)}
                                        className="block px-4 py-2 text-gray-700 hover:bg-blue-50 rounded-lg font-medium"
                                    >
                                        Chứng chỉ
                                    </Link>
                                    <Link
                                        to="/dashboard/settings"
                                        onClick={() => setShowMobileMenu(false)}
                                        className="block px-4 py-2 text-gray-700 hover:bg-blue-50 rounded-lg font-medium"
                                    >
                                        Cài đặt tài khoản
                                    </Link>
                                    <button
                                        onClick={() => {
                                            setShowMobileMenu(false);
                                            handleLogout();
                                        }}
                                        className="w-full text-left px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg font-medium"
                                    >
                                        Đăng xuất
                                    </button>
                                </>
                            )}

                            {!isAuthenticated && (
                                <div className="space-y-2 pt-2 border-t border-gray-200 mt-2">
                                    <Link
                                        to="/login"
                                        onClick={() => setShowMobileMenu(false)}
                                        className="block px-4 py-2 text-center text-gray-700 hover:text-blue-600 font-medium rounded-lg border border-gray-300"
                                    >
                                        Đăng nhập
                                    </Link>
                                    <Link
                                        to="/register"
                                        onClick={() => setShowMobileMenu(false)}
                                        className="block px-4 py-2 text-center bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg font-medium"
                                    >
                                        Đăng ký
                                    </Link>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </nav>
    );
};
