import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useMutation } from '@apollo/client'; 
import { Layout } from '../../components/common/Layout';
import { Input } from '../../components/common/Input';
import { Button } from '../../components/common/Button';
import { useAuthStore } from '../../lib/store';
import { REGISTER_MUTATION } from '../../graphql/mutations/auth';
import type { User } from '../../types';
interface RegisterMutationData {
  register: {
    token: string;
    refreshToken: string;
    user: {
      userId: string;
      fullName: string;
      email: string;
      avatarUrl?: string | null;
      bio?: string | null;
      roleName: string;
      createdAt: string;
      isActive: boolean;
    };
  };
}

interface RegisterMutationVariables {
  input: {
    fullName: string;
    email: string;
    password: string;
  };
}

export const RegisterPage = () => {
  const navigate = useNavigate();
  const { setAuth, token, user } = useAuthStore();
  
  // Redirect nếu đã đăng nhập
  useEffect(() => {
    if (token && user) {
      if (user.roleName === 'INSTRUCTOR' || user.roleName === 'ADMIN') {
        navigate('/instructor/dashboard', { replace: true });
      } else {
        navigate('/courses', { replace: true });
      }
    }
  }, [token, user, navigate]);
  
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [showTerms, setShowTerms] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const [registerMutation] = useMutation<
    RegisterMutationData,
    RegisterMutationVariables
  >(REGISTER_MUTATION);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.fullName) {
      newErrors.fullName = 'Họ tên không được để trống';
    }

    if (!formData.email) {
      newErrors.email = 'Email không được để trống';
    } else if (!formData.email.includes('@')) {
      newErrors.email = 'Email không hợp lệ';
    }

    if (!formData.password) {
      newErrors.password = 'Mật khẩu không được để trống';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Mật khẩu phải có ít nhất 6 ký tự';
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Xác nhận mật khẩu không được để trống';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Mật khẩu xác nhận không trùng khớp';
    }

    if (!agreeTerms) {
      newErrors.agree = 'Bạn cần đồng ý với điều khoản dịch vụ';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsLoading(true);
    setErrors({}); 

    try {
      const { data } = await registerMutation({
        variables: {
          input: {
            fullName: formData.fullName,
            email: formData.email,
            password: formData.password,
          },
        },
      });

      if (!data?.register) {
        setErrors({ form: 'Đăng ký thất bại. Vui lòng thử lại.' });
        return;
      }

      const { token, refreshToken, user } = data.register;

      localStorage.setItem('refresh_token', refreshToken);

      setAuth(token, user);

      navigate('/dashboard/my-courses');
      
    } catch (error: any) {
      console.error('Register error:', error);
      const message = error.message || 'Đăng ký thất bại. Vui lòng thử lại.';
      setErrors({ form: message });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Layout>
      <div className="min-h-[calc(100vh-200px)] flex items-center justify-center bg-gray-100 py-12">
        <div className="bg-white rounded-lg shadow-lg p-8 w-full max-w-md relative">
          <h1 className="text-3xl font-bold text-center mb-8 text-gray-800">
            Đăng ký tài khoản
          </h1>

          {errors.form && (
            <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
              {errors.form}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              type="text"
              name="fullName"
              label="Họ tên"
              placeholder="Nhập họ tên của bạn"
              value={formData.fullName}
              onChange={handleChange}
              error={errors.fullName}
            />

            <Input
              type="email"
              name="email"
              label="Email"
              placeholder="Nhập email của bạn"
              value={formData.email}
              onChange={handleChange}
              error={errors.email}
            />

            <Input
              type="password"
              name="password"
              label="Mật khẩu"
              placeholder="Nhập mật khẩu"
              value={formData.password}
              onChange={handleChange}
              error={errors.password}
            />

            <Input
              type="password"
              name="confirmPassword"
              label="Xác nhận mật khẩu"
              placeholder="Nhập lại mật khẩu"
              value={formData.confirmPassword}
              onChange={handleChange}
              error={errors.confirmPassword}
            />

            <div className="mt-2">
              <label className="flex items-center gap-2 text-sm text-gray-700">
                <input
                  type="checkbox"
                  checked={agreeTerms}
                  onChange={(e) => setAgreeTerms(e.target.checked)}
                  className="h-4 w-4"
                />
                <span>
                  Tôi đồng ý với{' '}
                  <button
                    type="button"
                    onClick={() => setShowTerms(true)}
                    className="text-blue-600 hover:underline"
                  >
                    điều khoản dịch vụ
                  </button>
                </span>
              </label>
              {errors.agree && (
                <p className="text-red-500 text-sm mt-1">{errors.agree}</p>
              )}
            </div>

            <Button
              variant="primary"
              type="submit"
              isLoading={isLoading}
              className="w-full mt-2"
            >
              Đăng ký
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-gray-600">
              Đã có tài khoản?{' '}
              <Link
                to="/login"
                className="text-blue-600 font-semibold hover:underline"
              >
                Đăng nhập
              </Link>
            </p>
          </div>
        </div>
      </div>

      {showTerms && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl max-w-xl w-full mx-4 max-h-[80vh] overflow-y-auto p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-800">
                Điều khoản dịch vụ
              </h2>
              <button
                className="text-gray-500 hover:text-gray-700 text-2xl leading-none"
                onClick={() => setShowTerms(false)}
              >
                ×
              </button>
            </div>

            <div className="text-sm text-gray-700 space-y-3">
              <p>
                Bằng việc sử dụng nền tảng LMS, bạn đồng ý không chia sẻ tài khoản,
                không phát tán nội dung khóa học khi chưa được phép, và tuân thủ
                đầy đủ quy định của chúng tôi.
              </p>
              <p>
                Mọi nội dung trong khóa học thuộc bản quyền của giảng viên và nền
                tảng. Bạn chỉ được phép sử dụng cho mục đích học tập cá nhân.
              </p>
              <p>
                Chúng tôi có thể cập nhật điều khoản mà không cần thông báo trước.
                Việc bạn tiếp tục sử dụng nền tảng đồng nghĩa với việc chấp nhận
                các thay đổi này.
              </p>
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <Button
                variant="secondary"
                type="button"
                onClick={() => setShowTerms(false)}
              >
                Đóng
              </Button>
              <Button
                variant="primary"
                type="button"
                onClick={() => {
                  setAgreeTerms(true);
                  setShowTerms(false);
                  setErrors((prev) => {
                    const { agree, ...rest } = prev;
                    return rest;
                  });
                }}
              >
                Tôi đồng ý
              </Button>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
};
