import { Link, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { useAuthStore } from '../../lib/store';

export const Navbar = () => {
  const { user, token, logout } = useAuthStore();
  const navigate = useNavigate();
  const isAuthenticated = !!token;
  const [showExploreMenu, setShowExploreMenu] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleExplore = (level?: string) => {
    setShowExploreMenu(false);
    if (level) {
      navigate(`/?level=${level}`);
    } else {
      navigate('/');
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
          <span className="text-xs font-semibold text-gray-600 uppercase tracking-wider">
            Platform
          </span>
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
              <span className={`text-sm transition-transform ${showExploreMenu ? 'rotate-180' : ''}`}>▼</span>
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
            <Link 
              to="/dashboard/my-courses" 
              className="text-gray-700 hover:text-blue-600 font-medium transition-colors"
            >
              📖 Khóa học của tôi
            </Link>
          )}
          
          {/* Auth Section */}
          {isAuthenticated ? (
            <div className="flex items-center gap-4 pl-4 border-l border-gray-200">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white font-bold text-sm">
                  {user?.fullName?.[0] || 'U'}
                </div>
                <span className="text-sm font-medium text-gray-700">
                  {user?.fullName?.split(' ')[0] || 'User'}
                </span>
              </div>
              <button
                onClick={handleLogout}
                className="text-sm text-gray-600 hover:text-red-600 font-medium transition-colors"
              >
                🚪 Đăng xuất
              </button>
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
