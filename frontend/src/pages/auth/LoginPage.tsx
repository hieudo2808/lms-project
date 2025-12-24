import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useMutation, useApolloClient } from '@apollo/client';
import { toast } from 'react-toastify'; // Import thêm toast để thông báo đẹp hơn
import { Layout } from '../../components/common/Layout';
import { Input } from '../../components/common/Input';
import { Button } from '../../components/common/Button';
import { useAuthStore } from '../../lib/store';
import { LOGIN_MUTATION } from '../../graphql/mutations/auth';
import type { LoginInput, AuthResponse } from '../../types'; // User import từ type chung
import { FcGoogle } from 'react-icons/fc';
import { FaGithub } from 'react-icons/fa';

interface LoginMutationData {
    login: AuthResponse;
}

interface LoginMutationVariables {
    input: LoginInput;
}

export const LoginPage = () => {
    const navigate = useNavigate();
    const client = useApolloClient();
    const { setAuth } = useAuthStore();

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});

    const [loginMutation] = useMutation<LoginMutationData, LoginMutationVariables>(LOGIN_MUTATION);

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
        setErrors({});

        try {
            await client.resetStore();
            const { data } = await loginMutation({
                variables: {
                    input: {
                        email,
                        password,
                    },
                },
            });

            if (!data?.login) {
                setErrors({ form: 'Đăng nhập thất bại. Không nhận được phản hồi.' });
                return;
            }

            const { token, user, refreshToken } = data.login;

            localStorage.setItem('refresh_token', refreshToken);
            setAuth(token, user);

            toast.success(`Xin chào, ${user.fullName}!`);

            if (user.roleName === 'ADMIN') {
                navigate('/admin/dashboard', { replace: true });
            } else if (user.roleName === 'INSTRUCTOR') {
                navigate('/instructor/dashboard', { replace: true });
            } else {
                navigate('/dashboard/my-courses', { replace: true });
            }
        } catch (error: any) {
            console.error('Login error:', error);
            const message = error.message || 'Đăng nhập thất bại. Vui lòng thử lại.';
            setErrors({ form: message });
            toast.error(message);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Layout>
            <div className="min-h-[calc(100vh-200px)] flex items-center justify-center bg-gray-100 py-12">
                <div className="bg-white rounded-lg shadow-lg p-8 w-full max-w-md">
                    <h1 className="text-3xl font-bold text-center mb-8 text-gray-800">Đăng nhập</h1>

                    {/* Hiển thị lỗi form tổng quát */}
                    {errors.form && (
                        <div className="mb-4 p-4 bg-red-50 border border-red-200 text-red-600 rounded-md text-sm">
                            {errors.form}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <Input
                            type="email"
                            label="Email"
                            placeholder="admin@example.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            error={errors.email}
                            disabled={isLoading}
                        />

                        <Input
                            type="password"
                            label="Mật khẩu"
                            placeholder="Nhập mật khẩu"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            error={errors.password}
                            disabled={isLoading}
                        />

                        <Button variant="primary" type="submit" isLoading={isLoading} className="w-full">
                            Đăng nhập
                        </Button>
                    </form>

                    <div className="mt-6 text-center">
                        <p className="text-gray-600">
                            Chưa có tài khoản?{' '}
                            <Link to="/register" className="text-blue-600 font-semibold hover:underline">
                                Đăng ký ngay
                            </Link>
                        </p>
                    </div>

                    <div className="mt-6 pt-6 border-t border-gray-200">
                        <p className="text-sm text-gray-500 text-center">Hoặc đăng nhập bằng</p>
                        <div className="grid grid-cols-2 gap-4 mt-4">
                            <button
                                type="button"
                                className="border border-gray-300 rounded-lg py-2 hover:bg-gray-50 flex items-center justify-center gap-2"
                            >
                                <FcGoogle className="text-xl" />
                                <span className="font-medium text-gray-700">Google</span>
                            </button>
                            <button
                                type="button"
                                className="border border-gray-300 rounded-lg py-2 hover:bg-gray-50 flex items-center justify-center gap-2"
                            >
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
