import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useMutation, useApolloClient } from '@apollo/client';
import { toast } from 'react-toastify';
import { GoogleLogin, GoogleOAuthProvider } from '@react-oauth/google';
import { Layout } from '../../components/common/Layout';
import { Input } from '../../components/common/Input';
import { Button } from '../../components/common/Button';
import { useAuthStore } from '../../lib/store';
import { LOGIN_MUTATION, GOOGLE_LOGIN_MUTATION } from '../../graphql/mutations/auth';
import type { LoginInput, AuthResponse } from '../../types';


const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || 'YOUR_ACTUAL_CLIENT_ID_HERE';

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

    const [login] = useMutation<LoginMutationData, LoginMutationVariables>(LOGIN_MUTATION);
    const [googleLogin] = useMutation(GOOGLE_LOGIN_MUTATION);

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

    const handleGoogleSuccess = async (credentialResponse: any) => {
        try {
            setIsLoading(true);
            const { data } = await googleLogin({
                variables: {
                    idToken: credentialResponse.credential,
                },
            });

            if (!data?.googleLogin) {
                toast.error('Đăng nhập Google thất bại');
                return;
            }

            const { token, user, refreshToken } = data.googleLogin;

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
            console.error('Google login error:', error);
            toast.error('Đăng nhập Google thất bại. Vui lòng thử lại.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleGoogleError = () => {
        toast.error('Đăng nhập Google bị hủy hoặc thất bại');
    };

    return (
        <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
            <Layout>
            <div className="min-h-[calc(100vh-200px)] flex items-center justify-center bg-gray-100 py-8 px-4 sm:px-6 lg:px-8">
                <div className="bg-white rounded-lg shadow-lg p-6 sm:p-8 w-full max-w-md">
                    <h1 className="text-2xl sm:text-3xl font-bold text-center mb-6 sm:mb-8 text-gray-800">Đăng nhập</h1>

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
                            placeholder="example@email.com"
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

                        <div className="flex justify-end">
                            <Link to="/forgot-password" className="text-sm text-blue-600 hover:text-blue-700 font-medium">
                                Quên mật khẩu?
                            </Link>
                        </div>

                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                            {isLoading ? 'Đang xử lý...' : 'Đăng nhập'}
                        </button>
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
                        <p className="text-sm text-gray-500 text-center mb-4">Hoặc đăng nhập bằng</p>
                        <div className="flex justify-center">
                            <GoogleLogin
                                onSuccess={handleGoogleSuccess}
                                onError={handleGoogleError}
                                theme="outline"
                                size="large"
                                text="continue_with"
                                shape="rectangular"
                            />
                        </div>
                    </div>
                </div>
            </div>
        </Layout>
        </GoogleOAuthProvider>
    );
};
