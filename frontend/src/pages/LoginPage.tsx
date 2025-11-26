import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Layout } from '../components/Layout';
import { Input } from '../components/Input';
import { Button } from '../components/Button';
import { useAuthStore } from '../lib/store';
import { authAPI } from '../services/api';
import type { AuthResponse } from '../types';
import { FcGoogle } from 'react-icons/fc';
import { FaGithub } from 'react-icons/fa';

export const LoginPage = () => {
  const navigate = useNavigate();
  const { setAuth } = useAuthStore();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!email) {
      newErrors.email = 'Email không được để trống';
    } else if (!email.includes('@')) {
      newErrors.email = 'Email không hợp lệ';
    }

    if (!password) {
      newErrors.password = 'Mật khẩu không được để trống';
    } else if (password.length < 6) {
      newErrors.password = 'Mật khẩu phải có ít nhất 6 ký tự';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsLoading(true);
    try {
      const response = await authAPI.login(email, password);
      const { token, user } = response.data as AuthResponse;

      setAuth(token, user);
      navigate('/dashboard/my-courses');
    } catch {
      setErrors({ form: 'Đăng nhập thất bại. Vui lòng thử lại.' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Layout>
      <div className="min-h-[calc(100vh-200px)] flex items-center justify-center bg-gray-100 py-12">
        <div className="bg-white rounded-lg shadow-lg p-8 w-full max-w-md">
          <h1 className="text-3xl font-bold text-center mb-8 text-gray-800">
            Đăng nhập
          </h1>

          {errors.form && (
            <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
              {errors.form}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              type="email"
              label="Email"
              placeholder="Nhập email của bạn"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              error={errors.email}
            />

            <Input
              type="password"
              label="Mật khẩu"
              placeholder="Nhập mật khẩu"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              error={errors.password}
            />

            <Button
              variant="primary"
              type="submit"
              isLoading={isLoading}
              className="w-full"
            >
              Đăng nhập
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-gray-600">
              Chưa có tài khoản?{' '}
              <Link
                to="/register"
                className="text-blue-600 font-semibold hover:underline"
              >
                Đăng ký ngay
              </Link>
            </p>
          </div>

          <div className="mt-6 pt-6 border-t border-gray-200">
            <p className="text-sm text-gray-500 text-center">
              Hoặc đăng nhập bằng
            </p>
            <div className="grid grid-cols-2 gap-4 mt-4">
              <button className="border border-gray-300 rounded-lg py-2 hover:bg-gray-50 flex items-center justify-center gap-2">
                <FcGoogle className="text-xl" />
                <span className="font-medium text-gray-700">Google</span>
              </button>
              <button className="border border-gray-300 rounded-lg py-2 hover:bg-gray-50 flex items-center justify-center gap-2">
                <FaGithub className="text-xl" />
                <span className="font-medium text-gray-700">GitHub</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};
