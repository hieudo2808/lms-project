import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useMutation } from '@apollo/client';
import { Layout } from '../../components/common/Layout';
import { Button } from '../../components/common/Button';
import { VERIFY_PAYMENT } from '../../graphql/mutations/enrollment';

export const PaymentCallbackPage = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const [verifyPayment] = useMutation(VERIFY_PAYMENT);

    const [status, setStatus] = useState<'processing' | 'success' | 'failed'>('processing');
    const [message, setMessage] = useState('Đang xác thực thanh toán...');

    useEffect(() => {
        const verifyTransaction = async () => {
            try {
                const transactionId = searchParams.get('vnp_TxnRef');
                const vnpResponseCode = searchParams.get('vnp_ResponseCode');

                if (!transactionId || !vnpResponseCode) {
                    setStatus('failed');
                    setMessage('Thiếu thông tin giao dịch từ VNPay.');
                    return;
                }

                const { data } = await verifyPayment({
                    variables: {
                        transactionId,
                        vnp_ResponseCode: vnpResponseCode,
                    },
                });

                const payment = data?.confirmPayment;

                if (payment?.paymentStatus === 'SUCCESS') {
                    setStatus('success');
                    setMessage('Thanh toán thành công! Bạn đã đăng ký khóa học.');
                } else {
                    setStatus('failed');
                    setMessage('Thanh toán thất bại. Vui lòng thử lại.');
                }
            } catch (error) {
                console.error('Payment verification failed:', error);
                setStatus('failed');
                setMessage('Có lỗi xảy ra khi xác thực thanh toán.');
            }
        };

        verifyTransaction();
    }, [searchParams, verifyPayment]);

    return (
        <Layout>
            <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4">
                <div className="max-w-md w-full">
                    <div className="bg-white rounded-lg shadow-lg p-8 text-center">
                        {status === 'processing' && (
                            <>
                                <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mx-auto mb-4"></div>
                                <h2 className="text-2xl font-bold text-gray-900 mb-2">Đang xử lý</h2>
                                <p className="text-gray-800">{message}</p>
                            </>
                        )}

                        {status === 'success' && (
                            <>
                                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <svg
                                        className="w-10 h-10 text-green-600"
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M5 13l4 4L19 7"
                                        />
                                    </svg>
                                </div>
                                <h2 className="text-2xl font-bold text-gray-900 mb-2">Thanh toán thành công!</h2>
                                <p className="text-gray-800 mb-6">{message}</p>
                                <div className="space-y-3">
                                    <Button
                                        variant="secondary"
                                        onClick={() => navigate('/dashboard/my-courses')}
                                        className="w-full"
                                    >
                                        Xem khóa học của tôi
                                    </Button>
                                </div>
                            </>
                        )}

                        {status === 'failed' && (
                            <>
                                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <svg
                                        className="w-10 h-10 text-red-600"
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M6 18L18 6M6 6l12 12"
                                        />
                                    </svg>
                                </div>
                                <h2 className="text-2xl font-bold text-gray-900 mb-2">Thanh toán thất bại</h2>
                                <p className="text-gray-800 mb-6">{message}</p>
                                <div className="space-y-3">
                                    <Button onClick={() => navigate('/')} className="w-full">
                                        Quay lại trang chủ
                                    </Button>
                                    <Button variant="secondary" onClick={() => navigate(-2)} className="w-full">
                                        Thử lại
                                    </Button>
                                </div>
                            </>
                        )}

                        {status !== 'processing' && (
                            <div className="mt-6 pt-6 border-t text-left">
                                <h3 className="text-sm font-semibold text-gray-900 mb-2">Chi tiết giao dịch</h3>
                                <dl className="space-y-1 text-sm">
                                    {searchParams.get('vnp_TxnRef') && (
                                        <div className="flex justify-between">
                                            <dt className="text-gray-800">Mã giao dịch:</dt>
                                            <dd className="font-medium text-gray-900">
                                                {searchParams.get('vnp_TxnRef')}
                                            </dd>
                                        </div>
                                    )}
                                    {searchParams.get('vnp_Amount') && (
                                        <div className="flex justify-between">
                                            <dt className="text-gray-800">Số tiền:</dt>
                                            <dd className="font-medium text-gray-900">
                                                {(Number(searchParams.get('vnp_Amount')) / 100).toLocaleString('vi-VN')}{' '}
                                                ₫
                                            </dd>
                                        </div>
                                    )}
                                    {searchParams.get('vnp_PayDate') && (
                                        <div className="flex justify-between">
                                            <dt className="text-gray-800">Thời gian:</dt>
                                            <dd className="font-medium text-gray-900">
                                                {new Date(
                                                    searchParams
                                                        .get('vnp_PayDate')
                                                        ?.replace(
                                                            /(\d{4})(\d{2})(\d{2})(\d{2})(\d{2})(\d{2})/,
                                                            '$1-$2-$3T$4:$5:$6',
                                                        ) || '',
                                                ).toLocaleString('vi-VN')}
                                            </dd>
                                        </div>
                                    )}
                                </dl>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </Layout>
    );
};
