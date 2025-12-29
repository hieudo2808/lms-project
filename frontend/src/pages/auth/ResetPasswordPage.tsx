import { useState } from 'react';
import { useMutation } from '@apollo/client';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Layout } from '../../components/common/Layout';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { RESET_PASSWORD } from '../../graphql/mutations/auth';
import { toast } from 'react-toastify';

export const ResetPasswordPage = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const email = location.state?.email || '';

    const [resetCode, setResetCode] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

    const [resetPassword, { loading }] = useMutation(RESET_PASSWORD);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!resetCode || !newPassword || !confirmPassword) {
            toast.error('Vui lòng điền đầy đủ thông tin');
            return;
        }

        if (newPassword !== confirmPassword) {
            toast.error('Mật khẩu xác nhận không khớp');
            return;
        }

        if (newPassword.length < 6) {
            toast.error('Mật khẩu phải có ít nhất 6 ký tự');
            return;
        }

        try {
            await resetPassword({
                variables: {
                    resetCode,
                    newPassword,
                },
            });

            toast.success('Đặt lại mật khẩu thành công!');
            navigate('/login');
        } catch (error: any) {
            toast.error(error.message || 'Mã xác nhận không hợp lệ hoặc đã hết hạn');
        }
    };

    return (
        <Layout>
            <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center py-12 px-4">
                <div className="max-w-md w-full">
                    <div className="bg-white rounded-2xl shadow-xl p-8">
                        <div className="text-center mb-8">
                            <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
                                <svg
                                    className="w-8 h-8 text-green-600"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                                    />
                                </svg>
                            </div>
                            <h1 className="text-3xl font-bold text-gray-900 mb-2">Đặt lại mật khẩu</h1>
                            {email && (
                                <p className="text-sm text-gray-600">
                                    Mã xác nhận đã được gửi đến: <strong>{email}</strong>
                                </p>
                            )}
                            <p className="text-gray-600 mt-2">Nhập mã xác nhận và mật khẩu mới</p>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div>
                                <label htmlFor="resetCode" className="block text-sm font-medium text-gray-700 mb-2">
                                    Mã xác nhận (6 chữ số)
                                </label>
                                <Input
                                    id="resetCode"
                                    type="text"
                                    value={resetCode}
                                    onChange={(e) => setResetCode(e.target.value)}
                                    placeholder="123456"
                                    maxLength={6}
                                    required
                                    disabled={loading}
                                    className="text-center text-2xl tracking-widest font-mono"
                                />
                                <p className="mt-1 text-xs text-gray-500">Mã có hiệu lực trong 15 phút</p>
                            </div>

                            <div>
                                <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700 mb-2">
                                    Mật khẩu mới
                                </label>
                                <Input
                                    id="newPassword"
                                    type="password"
                                    value={newPassword}
                                    onChange={(e) => setNewPassword(e.target.value)}
                                    placeholder="Ít nhất 6 ký tự"
                                    required
                                    disabled={loading}
                                />
                            </div>

                            <div>
                                <label
                                    htmlFor="confirmPassword"
                                    className="block text-sm font-medium text-gray-700 mb-2"
                                >
                                    Xác nhận mật khẩu
                                </label>
                                <Input
                                    id="confirmPassword"
                                    type="password"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    placeholder="Nhập lại mật khẩu mới"
                                    required
                                    disabled={loading}
                                />
                            </div>

                            <Button type="submit" className="w-full" disabled={loading}>
                                {loading ? 'Đang xử lý...' : 'Đặt lại mật khẩu'}
                            </Button>
                        </form>

                        <div className="mt-6 text-center space-y-2">
                            <Link to="/forgot-password" className="block text-sm text-gray-600 hover:text-gray-700">
                                Chưa nhận được mã? Gửi lại
                            </Link>
                            <Link to="/login" className="block text-sm text-blue-600 hover:text-blue-700 font-medium">
                                ← Quay lại đăng nhập
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </Layout>
    );
};
