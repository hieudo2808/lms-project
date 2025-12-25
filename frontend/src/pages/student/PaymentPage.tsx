import { useState, useEffect } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { useQuery, useMutation } from '@apollo/client';
import { Layout } from '../../components/common/Layout';
import { Button } from '../../components/common/Button';
import { GET_COURSE_BY_ID } from '../../graphql/queries/course';
import { INITIATE_PAYMENT } from '../../graphql/mutations/enrollment';

export const PaymentPage = () => {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState('VNPAY');
  const [isProcessing, setIsProcessing] = useState(false);

  const { data: courseData, loading: courseLoading } = useQuery(GET_COURSE_BY_ID, {
    variables: { courseId },
    skip: !courseId,
  });

  const [initiatePayment] = useMutation(INITIATE_PAYMENT);

  const course = courseData?.getCourseById;

  const handlePayment = async () => {
    if (!courseId) return;
    
    setIsProcessing(true);
    try {
      const { data } = await initiatePayment({
        variables: {
          input: {
            courseId,
            paymentProvider: selectedPaymentMethod,
            returnUrl: `${window.location.origin}/payment/callback`,
          },
        },
      });

      if (data?.initiatePayment?.paymentUrl) {
        // Redirect to VNPay payment page
        window.location.href = data.initiatePayment.paymentUrl;
      }
    } catch (error) {
      console.error('Payment initiation failed:', error);
      alert('Không thể khởi tạo thanh toán. Vui lòng thử lại.');
      setIsProcessing(false);
    }
  };

  if (courseLoading) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Đang tải thông tin khóa học...</p>
          </div>
        </div>
      </Layout>
    );
  }

  if (!course) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <p className="text-xl text-gray-600">Không tìm thấy khóa học</p>
            <Button onClick={() => navigate('/')} className="mt-4">
              Quay lại trang chủ
            </Button>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4">
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <h1 className="text-2xl font-bold mb-6">Thanh toán khóa học</h1>
            
            {/* Course Info */}
            <div className="border-b pb-6 mb-6">
              <h2 className="text-lg font-semibold mb-2">Thông tin khóa học</h2>
              <div className="flex items-start gap-4">
                {course.thumbnailUrl && (
                  <img
                    src={course.thumbnailUrl}
                    alt={course.title}
                    className="w-32 h-20 object-cover rounded"
                  />
                )}
                <div>
                  <h3 className="font-semibold text-gray-900">{course.title}</h3>
                  <p className="text-sm text-gray-600 mt-1 line-clamp-2">{course.description}</p>
                </div>
              </div>
            </div>

            {/* Payment Method Selection */}
            <div className="border-b pb-6 mb-6">
              <h2 className="text-lg font-semibold mb-4">Phương thức thanh toán</h2>
              <div className="space-y-3">
                <label className="flex items-center p-4 border rounded-lg cursor-pointer hover:bg-gray-50">
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="VNPAY"
                    checked={selectedPaymentMethod === 'VNPAY'}
                    onChange={(e) => setSelectedPaymentMethod(e.target.value)}
                    className="w-4 h-4 text-blue-600"
                  />
                  <div className="ml-3 flex items-center gap-3">
                    <img
                      src="https://vnpay.vn/s1/statics.vnpay.vn/2023/9/06ncktiwd6dc1694418196384.png"
                      alt="VNPay"
                      className="h-8"
                    />
                    <div>
                      <p className="font-medium">VNPay</p>
                      <p className="text-sm text-gray-500">
                        Thanh toán qua cổng VNPay (ATM, Visa, MasterCard, QR)
                      </p>
                    </div>
                  </div>
                </label>

                {/* Can add more payment methods here */}
                <label className="flex items-center p-4 border rounded-lg cursor-not-allowed opacity-50">
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="MOMO"
                    disabled
                    className="w-4 h-4 text-blue-600"
                  />
                  <div className="ml-3">
                    <p className="font-medium">MoMo (Sắp ra mắt)</p>
                    <p className="text-sm text-gray-500">Ví điện tử MoMo</p>
                  </div>
                </label>
              </div>
            </div>

            {/* Order Summary */}
            <div className="bg-gray-50 rounded-lg p-6 mb-6">
              <h2 className="text-lg font-semibold mb-4">Chi tiết thanh toán</h2>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600">Giá khóa học:</span>
                  <span className="font-medium">
                    {course.price > 0 
                      ? `${course.price.toLocaleString('vi-VN')} ₫`
                      : 'Miễn phí'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Phí xử lý:</span>
                  <span className="font-medium">0 ₫</span>
                </div>
                <div className="border-t pt-2 mt-2">
                  <div className="flex justify-between text-lg font-bold">
                    <span>Tổng cộng:</span>
                    <span className="text-blue-600">
                      {course.price > 0 
                        ? `${course.price.toLocaleString('vi-VN')} ₫`
                        : '0 ₫'}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-4">
              <Button
                variant="secondary"
                onClick={() => navigate(`/courses/${course.slug}`)}
                className="flex-1"
                disabled={isProcessing}
              >
                Quay lại
              </Button>
              <Button
                onClick={handlePayment}
                className="flex-1"
                disabled={isProcessing || !selectedPaymentMethod}
              >
                {isProcessing ? (
                  <div className="flex items-center justify-center gap-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    <span>Đang xử lý...</span>
                  </div>
                ) : (
                  'Thanh toán ngay'
                )}
              </Button>
            </div>

            {/* Security Note */}
            <div className="mt-6 p-4 bg-blue-50 rounded-lg">
              <div className="flex gap-2">
                <svg className="w-5 h-5 text-blue-600 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
                <div className="text-sm">
                  <p className="font-medium text-blue-900">Thanh toán an toàn</p>
                  <p className="text-blue-700 mt-1">
                    Giao dịch của bạn được bảo mật bởi cổng thanh toán VNPay với mã hóa SSL 256-bit.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};
