import { useState, useEffect } from 'react';
import { X } from 'lucide-react';

export const CacheClearBanner = () => {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const authStore = localStorage.getItem('auth-store');
    
    if (authStore) {
      try {
        const parsed = JSON.parse(authStore);
        if (parsed.state?.token && !window.location.pathname.includes('/login') && !window.location.pathname.includes('/register')) {
          setShow(false);
        } else if (parsed.state?.token) {
          setShow(true);
        }
      } catch (e) {
        console.error('Failed to parse auth-store', e);
      }
    }
  }, []);

  const handleClear = () => {
    if (confirm('Bạn có chắc chắn muốn đăng xuất và xóa dữ liệu đã lưu?')) {
      localStorage.clear();
      sessionStorage.clear();
      window.location.href = '/';
    }
  };

  const handleDismiss = () => {
    setShow(false);
  };

  if (!show) return null;

  return (
    <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-[9999] max-w-2xl w-full px-4">
      <div className="bg-yellow-50 border-2 border-yellow-400 rounded-lg shadow-xl p-4 flex items-start gap-3">
        <div className="flex-shrink-0 text-2xl">⚠️</div>
        <div className="flex-1">
          <h3 className="font-bold text-yellow-900 mb-1">
            Phát hiện phiên đăng nhập cũ
          </h3>
          <p className="text-sm text-yellow-800 mb-3">
            Hệ thống phát hiện bạn đang có phiên đăng nhập cũ. 
            Vui lòng xóa dữ liệu cache để tránh lỗi hiển thị.
          </p>
          <div className="flex gap-2">
            <button
              onClick={handleClear}
              className="px-4 py-2 bg-yellow-600 hover:bg-yellow-700 text-white rounded-lg text-sm font-medium transition-colors"
            >
              🗑️ Xóa cache & Làm mới
            </button>
            <button
              onClick={handleDismiss}
              className="px-4 py-2 bg-white hover:bg-gray-100 text-gray-700 rounded-lg text-sm font-medium border border-gray-300 transition-colors"
            >
              Bỏ qua
            </button>
          </div>
        </div>
        <button
          onClick={handleDismiss}
          className="flex-shrink-0 text-yellow-600 hover:text-yellow-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};
