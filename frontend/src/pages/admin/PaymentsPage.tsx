import { useState } from 'react';
import { useQuery } from '@apollo/client';
import { CreditCard, Loader2, Search, Filter, DollarSign, CheckCircle, Clock, XCircle, TrendingUp } from 'lucide-react';
import { GET_ALL_PAYMENTS, GET_REVENUE_REPORT } from '../../graphql/queries/admin';

interface Payment {
    paymentId: string;
    userId: string;
    courseId: string;
    amount: number;
    paymentProvider: string;
    transactionId: string;
    paymentStatus: string;
    paidAt: string | null;
    createdAt: string;
}

interface RevenueReport {
    totalRevenue: number;
    totalPayments: number;
    completedPayments: number;
    pendingPayments: number;
    failedPayments: number;
    averagePayment: number;
}

const StatusBadge = ({ status }: { status: string }) => {
    const config: Record<string, { bg: string; text: string; icon: React.ReactNode }> = {
        COMPLETED: { bg: 'bg-green-50', text: 'text-green-600', icon: <CheckCircle size={14} /> },
        PENDING: { bg: 'bg-yellow-50', text: 'text-yellow-600', icon: <Clock size={14} /> },
        FAILED: { bg: 'bg-red-50', text: 'text-red-600', icon: <XCircle size={14} /> },
    };
    const c = config[status] || config.PENDING;
    return (
        <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${c.bg} ${c.text}`}>
            {c.icon} {status}
        </span>
    );
};

export const PaymentsPage = () => {
    const [statusFilter, setStatusFilter] = useState<string>('');
    const [searchTerm, setSearchTerm] = useState('');

    const { data, loading, error } = useQuery(GET_ALL_PAYMENTS, {
        variables: { page: 0, limit: 100, status: statusFilter || null },
        fetchPolicy: 'network-only',
    });

    const { data: reportData } = useQuery(GET_REVENUE_REPORT, {
        variables: { startDate: null, endDate: null },
    });

    const payments: Payment[] = data?.getAllPayments || [];
    const report: RevenueReport | null = reportData?.getRevenueReport || null;

    const filteredPayments = payments.filter((p) => p.transactionId?.toLowerCase().includes(searchTerm.toLowerCase()));

    const formatCurrency = (amount: number) =>
        new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);

    const formatDate = (dateStr: string | null) => {
        if (!dateStr) return '-';
        return new Date(dateStr).toLocaleString('vi-VN');
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center py-20">
                <Loader2 className="w-10 h-10 animate-spin text-red-600" />
            </div>
        );
    }

    if (error) {
        return <div className="p-8 text-red-500">Lỗi: {error.message}</div>;
    }

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-gray-900">Quản lý thanh toán</h1>
                <p className="text-gray-500 text-sm">Theo dõi và quản lý tất cả giao dịch trong hệ thống</p>
            </div>

            {report && (
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="bg-white p-5 rounded-xl border shadow-sm">
                        <div className="flex items-center gap-3">
                            <div className="p-2.5 rounded-lg bg-green-50">
                                <DollarSign className="w-5 h-5 text-green-600" />
                            </div>
                            <div>
                                <p className="text-sm text-gray-500">Tổng doanh thu</p>
                                <p className="text-xl font-bold text-gray-800">{formatCurrency(report.totalRevenue)}</p>
                            </div>
                        </div>
                    </div>
                    <div className="bg-white p-5 rounded-xl border shadow-sm">
                        <div className="flex items-center gap-3">
                            <div className="p-2.5 rounded-lg bg-blue-50">
                                <CreditCard className="w-5 h-5 text-blue-600" />
                            </div>
                            <div>
                                <p className="text-sm text-gray-500">Tổng giao dịch</p>
                                <p className="text-xl font-bold text-gray-800">{report.totalPayments}</p>
                            </div>
                        </div>
                    </div>
                    <div className="bg-white p-5 rounded-xl border shadow-sm">
                        <div className="flex items-center gap-3">
                            <div className="p-2.5 rounded-lg bg-green-50">
                                <CheckCircle className="w-5 h-5 text-green-600" />
                            </div>
                            <div>
                                <p className="text-sm text-gray-500">Hoàn thành</p>
                                <p className="text-xl font-bold text-gray-800">{report.completedPayments}</p>
                            </div>
                        </div>
                    </div>
                    <div className="bg-white p-5 rounded-xl border shadow-sm">
                        <div className="flex items-center gap-3">
                            <div className="p-2.5 rounded-lg bg-purple-50">
                                <TrendingUp className="w-5 h-5 text-purple-600" />
                            </div>
                            <div>
                                <p className="text-sm text-gray-500">Trung bình</p>
                                <p className="text-xl font-bold text-gray-800">
                                    {formatCurrency(report.averagePayment)}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <div className="flex flex-wrap gap-4 items-center bg-white p-4 rounded-xl border">
                <div className="relative flex-1 min-w-[200px]">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    <input
                        type="text"
                        placeholder="Tìm theo Transaction ID..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                    />
                </div>
                <div className="flex items-center gap-2">
                    <Filter size={18} className="text-gray-400" />
                    <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        className="border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-red-500"
                    >
                        <option value="">Tất cả trạng thái</option>
                        <option value="COMPLETED">Hoàn thành</option>
                        <option value="PENDING">Đang chờ</option>
                        <option value="FAILED">Thất bại</option>
                    </select>
                </div>
            </div>

            <div className="bg-white rounded-xl border overflow-hidden">
                <table className="w-full">
                    <thead className="bg-gray-50 border-b">
                        <tr>
                            <th className="text-left px-4 py-3 text-sm font-semibold text-gray-600">Transaction ID</th>
                            <th className="text-left px-4 py-3 text-sm font-semibold text-gray-600">Số tiền</th>
                            <th className="text-left px-4 py-3 text-sm font-semibold text-gray-600">Provider</th>
                            <th className="text-left px-4 py-3 text-sm font-semibold text-gray-600">Trạng thái</th>
                            <th className="text-left px-4 py-3 text-sm font-semibold text-gray-600">Thời gian</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y">
                        {filteredPayments.length === 0 ? (
                            <tr>
                                <td colSpan={5} className="text-center py-8 text-gray-500">
                                    Không có giao dịch nào
                                </td>
                            </tr>
                        ) : (
                            filteredPayments.map((payment) => (
                                <tr key={payment.paymentId} className="hover:bg-gray-50">
                                    <td className="px-4 py-3 font-mono text-sm text-gray-700">
                                        {payment.transactionId || '-'}
                                    </td>
                                    <td className="px-4 py-3 font-semibold text-gray-800">
                                        {formatCurrency(payment.amount)}
                                    </td>
                                    <td className="px-4 py-3 text-gray-600">{payment.paymentProvider || 'N/A'}</td>
                                    <td className="px-4 py-3">
                                        <StatusBadge status={payment.paymentStatus} />
                                    </td>
                                    <td className="px-4 py-3 text-sm text-gray-500">
                                        {formatDate(payment.paidAt || payment.createdAt)}
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};
