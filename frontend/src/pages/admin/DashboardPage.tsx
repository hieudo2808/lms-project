import { useQuery } from '@apollo/client';
import {
    Users,
    GraduationCap,
    BookOpen,
    DollarSign,
    UserCheck,
    ShoppingCart,
    TrendingUp,
    AlertCircle,
    Loader2,
} from 'lucide-react';
import { GET_SYSTEM_STATISTICS } from '../../graphql/queries/admin';

interface SystemStats {
    totalUsers: number;
    totalInstructors: number;
    totalStudents: number;
    totalCourses: number;
    publishedCourses: number;
    unpublishedCourses: number;
    totalEnrollments: number;
    totalPayments: number;
    totalRevenue: number;
    completedPayments: number;
    pendingPayments: number;
    failedPayments: number;
}

const StatCard = ({
    title,
    value,
    icon: Icon,
    color,
    bgColor,
    subtext,
}: {
    title: string;
    value: string | number;
    icon: React.ElementType;
    color: string;
    bgColor: string;
    subtext?: string;
}) => (
    <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
        <div className="flex items-center gap-4">
            <div className={`p-3 rounded-lg ${bgColor}`}>
                <Icon className={`w-6 h-6 ${color}`} />
            </div>
            <div className="flex-1">
                <p className="text-sm text-gray-500">{title}</p>
                <p className="text-2xl font-bold text-gray-800">{value}</p>
                {subtext && <p className="text-xs text-gray-400 mt-1">{subtext}</p>}
            </div>
        </div>
    </div>
);

export const AdminDashboardPage = () => {
    const { data, loading, error } = useQuery(GET_SYSTEM_STATISTICS, {
        fetchPolicy: 'network-only',
    });

    const stats: SystemStats | null = data?.getSystemStatistics || null;

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND',
        }).format(amount);
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center py-20">
                <Loader2 className="w-10 h-10 animate-spin text-red-600" />
            </div>
        );
    }

    if (error) {
        return (
            <div className="bg-red-50 border border-red-200 p-6 rounded-xl text-red-600">
                <AlertCircle className="w-6 h-6 mb-2" />
                <p>Lỗi tải dữ liệu: {error.message}</p>
            </div>
        );
    }

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-2xl font-bold text-gray-800">Dashboard</h1>
                <p className="text-gray-500 mt-1">Tổng quan hệ thống LMS</p>
            </div>

            <div>
                <h2 className="text-lg font-semibold text-gray-700 mb-4">Người dùng</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <StatCard
                        title="Tổng người dùng"
                        value={stats?.totalUsers || 0}
                        icon={Users}
                        color="text-blue-600"
                        bgColor="bg-blue-100"
                    />
                    <StatCard
                        title="Giảng viên"
                        value={stats?.totalInstructors || 0}
                        icon={GraduationCap}
                        color="text-purple-600"
                        bgColor="bg-purple-100"
                    />
                    <StatCard
                        title="Học viên"
                        value={stats?.totalStudents || 0}
                        icon={UserCheck}
                        color="text-green-600"
                        bgColor="bg-green-100"
                    />
                    <StatCard
                        title="Đăng ký học"
                        value={stats?.totalEnrollments || 0}
                        icon={ShoppingCart}
                        color="text-orange-600"
                        bgColor="bg-orange-100"
                    />
                </div>
            </div>

            <div>
                <h2 className="text-lg font-semibold text-gray-700 mb-4">Khóa học</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <StatCard
                        title="Tổng khóa học"
                        value={stats?.totalCourses || 0}
                        icon={BookOpen}
                        color="text-indigo-600"
                        bgColor="bg-indigo-100"
                        subtext={`${stats?.publishedCourses || 0} đã xuất bản`}
                    />
                    <StatCard
                        title="Đã xuất bản"
                        value={stats?.publishedCourses || 0}
                        icon={BookOpen}
                        color="text-green-600"
                        bgColor="bg-green-100"
                    />
                    <StatCard
                        title="Chờ duyệt"
                        value={stats?.unpublishedCourses || 0}
                        icon={BookOpen}
                        color="text-yellow-600"
                        bgColor="bg-yellow-100"
                    />
                </div>
            </div>

            <div>
                <h2 className="text-lg font-semibold text-gray-700 mb-4">Doanh thu & Thanh toán</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <StatCard
                        title="Tổng doanh thu"
                        value={formatCurrency(stats?.totalRevenue || 0)}
                        icon={DollarSign}
                        color="text-green-600"
                        bgColor="bg-green-100"
                    />
                    <StatCard
                        title="Thanh toán thành công"
                        value={stats?.completedPayments || 0}
                        icon={TrendingUp}
                        color="text-blue-600"
                        bgColor="bg-blue-100"
                    />
                    <StatCard
                        title="Đang chờ"
                        value={stats?.pendingPayments || 0}
                        icon={AlertCircle}
                        color="text-yellow-600"
                        bgColor="bg-yellow-100"
                    />
                    <StatCard
                        title="Thất bại"
                        value={stats?.failedPayments || 0}
                        icon={AlertCircle}
                        color="text-red-600"
                        bgColor="bg-red-100"
                    />
                </div>
            </div>
        </div>
    );
};
