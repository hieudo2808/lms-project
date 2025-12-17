import { useEffect } from 'react';
import { Link, NavLink, useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { useQuery } from '@apollo/client/react/hooks';
import { useAuthStore } from '../lib/store';
import { ME_QUERY } from '../graphql/queries/user';
import type { User } from '../types';

export const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams, setSearchParams] = useSearchParams();

  const { token, user, setAuth, logout } = useAuthStore();

  const isAuthenticated = !!token;

  // Chỉ fetch me khi có token nhưng chưa có user trong store
  const shouldFetchMe = !!token && !user;

  const { data, error } = useQuery(ME_QUERY, {
    skip: !shouldFetchMe,
    fetchPolicy: 'network-only',
  });

  // Nếu token không hợp lệ / hết hạn → logout
  useEffect(() => {
    if (!error) return;
    // GraphQL backend của bạn sẽ trả UNAUTHORIZED nếu token sai
    console.error('me() error:', error);
    logout();
  }, [error, logout]);

  // Khi có dữ liệu me lần đầu → đồng bộ vào Zustand
  useEffect(() => {
    if (!data?.me || !token || user) return;

    const gUser = data.me;

    const mappedUser: User = {
      id: gUser.userId,
      email: gUser.email,
      fullName: gUser.fullName,
      avatarUrl: gUser.avatarUrl ?? undefined,
      bio: gUser.bio ?? undefined,
      role: gUser.roleName,
    };

    // Giữ nguyên token hiện tại, chỉ cập nhật user
    setAuth(token, mappedUser);
  }, [data, token, user, setAuth]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleFilterLevel = (level: string | null) => {
    const params = new URLSearchParams(searchParams.toString());
    if (level) {
      params.set('level', level);
    } else {
      params.delete('level');
    }
    setSearchParams(params);

    if (location.pathname !== '/') {
      navigate(`/?${params.toString()}`);
    }
  };

  const shortName =
    user?.fullName?.trim().split(' ').slice(-1)[0] ?? 'Học viên';
  const firstLetter = shortName.charAt(0).toUpperCase();

  return (
    <nav className="bg-white shadow-sm">
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex justify-between h-16 items-center">
          {/* Logo + tên */}
          <div className="flex items-center gap-3">
            <Link to="/" className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-lg bg-blue-600 flex items-center justify-center text-white font-bold text-lg">
                LMS
              </div>
              <span className="font-semibold text-gray-800 hidden sm:inline-block">
                LMS Platform
              </span>
            </Link>
          </div>

          {/* Menu giữa */}
          <div className="hidden md:flex items-center gap-6">
            <button
              type="button"
              onClick={() => handleFilterLevel(null)}
              className="text-gray-700 hover:text-blue-600 text-sm font-medium"
            >
              🔍 Khám phá
            </button>
            <button
              type="button"
              onClick={() => handleFilterLevel('beginner')}
              className="text-gray-600 hover:text-blue-500 text-xs"
            >
              Beginner
            </button>
            <button
              type="button"
              onClick={() => handleFilterLevel('intermediate')}
              className="text-gray-600 hover:text-blue-500 text-xs"
            >
              Intermediate
            </button>
            <button
              type="button"
              onClick={() => handleFilterLevel('advanced')}
              className="text-gray-600 hover:text-blue-500 text-xs"
            >
              Advanced
            </button>
          </div>

          {/* Phần bên phải: login / user */}
          <div className="flex items-center gap-4">
            {isAuthenticated && user ? (
              <>
                <NavLink
                  to="/dashboard/my-courses"
                  className={({ isActive }) =>
                    `text-sm font-medium ${
                      isActive ? 'text-blue-600' : 'text-gray-700'
                    } hover:text-blue-600`
                  }
                >
                  📖 Khóa học của tôi
                </NavLink>
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-semibold text-sm">
                    {firstLetter}
                  </div>
                  <span className="text-sm text-gray-700 max-w-[120px] truncate">
                    {shortName}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={handleLogout}
                  className="text-sm text-gray-600 hover:text-red-500"
                >
                  Đăng xuất
                </button>
              </>
            ) : (
              <>
                <NavLink
                  to="/login"
                  className={({ isActive }) =>
                    `text-sm font-medium ${
                      isActive ? 'text-blue-600' : 'text-gray-700'
                    } hover:text-blue-600`
                  }
                >
                  Đăng nhập
                </NavLink>
                <NavLink
                  to="/register"
                  className={({ isActive }) =>
                    `text-sm font-medium ${
                      isActive ? 'text-blue-600' : 'text-gray-700'
                    } hover:text-blue-600`
                  }
                >
                  Đăng ký
                </NavLink>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};
