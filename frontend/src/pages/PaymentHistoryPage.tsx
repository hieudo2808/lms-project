import { useEffect, useState } from 'react';
import { Layout } from '../components/Layout';
import { paymentAPI } from '../services/api';
import type { PaymentHistoryItem } from '../types';

export const PaymentHistoryPage = () => {
  const [payments, setPayments] = useState<PaymentHistoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPayments = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const res = await paymentAPI.getMyPayments();
        setPayments(res.data as PaymentHistoryItem[]);
      } catch (err) {
        console.error(err);
        setError('Không tải được lịch sử thanh toán.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchPayments();
  }, []);

  return (
    <Layout>
      <div className="max-w-5xl mx-auto px-4 py-10">
        <h1 className="text-2xl font-bold mb-6">💳 Lịch sử thanh toán</h1>

        {isLoading && <p className="text-gray-500">Đang tải...</p>}
        {error && <p className="text-red-600 text-sm mb-4">{error}</p>}
        {!isLoading && !error && payments.length === 0 && (
          <p className="text-gray-500 text-sm">
            Bạn chưa có thanh toán nào.
          </p>
        )}

        {!isLoading && !error && payments.length > 0 && (
          <div className="bg-white shadow-sm rounded-xl border border-gray-200 overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left">Khóa học</th>
                  <th className="px-4 py-3 text-right">Số tiền</th>
                  <th className="px-4 py-3 text-center">Phương thức</th>
                  <th className="px-4 py-3 text-center">Trạng thái</th>
                  <th className="px-4 py-3 text-center">Thời gian</th>
                </tr>
              </thead>
              <tbody>
                {payments.map((p) => (
                  <tr key={p.id} className="border-t">
                    <td className="px-4 py-3">
                      <p className="font-medium text-gray-800">
                        {p.courseTitle}
                      </p>
                      <p className="text-xs text-gray-500">
                        Mã giao dịch: {p.transactionId || '—'}
                      </p>
                    </td>
                    <td className="px-4 py-3 text-right font-semibold">
                      {p.amount.toLocaleString()}₫
                    </td>
                    <td className="px-4 py-3 text-center">
                      {p.paymentMethod || '—'}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span
                        className={
                          'inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold ' +
                          (p.paymentStatus === 'SUCCESS'
                            ? 'bg-green-100 text-green-700'
                            : p.paymentStatus === 'PENDING'
                            ? 'bg-yellow-100 text-yellow-700'
                            : 'bg-red-100 text-red-700')
                        }
                      >
                        {p.paymentStatus}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center text-xs text-gray-500">
                      {new Date(p.createdAt).toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </Layout>
  );
};
