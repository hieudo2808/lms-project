import { useState } from 'react';
import { useQuery } from '@apollo/client';
import { DollarSign, Loader2, Users, CreditCard, TrendingUp, BarChart3 } from 'lucide-react';
import { GET_MY_COURSES_QUERY, GET_COURSE_REVENUE, GET_COURSE_MONTHLY_REVENUE } from '../../graphql/queries/instructor';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface Course {
    courseId: string;
    title: string;
    price: number;
}

interface CourseRevenue {
    courseId: string;
    totalRevenue: number;
    totalEnrollments: number;
    totalPayments: number;
    averagePrice: number;
}

const StatCard = ({
    title,
    value,
    icon: Icon,
    color,
    bgColor,
}: {
    title: string;
    value: string | number;
    icon: React.ElementType;
    color: string;
    bgColor: string;
}) => (
    <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
        <div className="flex items-center gap-4">
            <div className={`p-3 rounded-lg ${bgColor}`}>
                <Icon className={`w-6 h-6 ${color}`} />
            </div>
            <div>
                <p className="text-sm text-gray-500">{title}</p>
                <p className="text-2xl font-bold text-gray-800">{value}</p>
            </div>
        </div>
    </div>
);

export const AnalyticsPage = () => {
    const [selectedCourseId, setSelectedCourseId] = useState<string>('');

    // Lấy danh sách khóa học
    const { data: coursesData, loading: coursesLoading } = useQuery(GET_MY_COURSES_QUERY);
    const courses: Course[] = coursesData?.getMyCourses || [];

    // Lấy doanh thu khi chọn khóa học
    const { data: revenueData, loading: revenueLoading } = useQuery(GET_COURSE_REVENUE, {
        variables: { courseId: selectedCourseId },
        skip: !selectedCourseId,
    });
    const revenue: CourseRevenue | null = revenueData?.getCourseRevenue || null;

    // Lấy doanh thu theo tháng cho khóa học đã chọn
    const { data: monthlyData } = useQuery(GET_COURSE_MONTHLY_REVENUE, {
        variables: { courseId: selectedCourseId, months: 6 },
        skip: !selectedCourseId,
    });

    // Transform data for chart
    const chartData = (monthlyData?.getCourseMonthlyRevenue || []).map((item: any) => ({
        month: item.month.replace(/ \d{4}$/, ''),
        revenue: item.revenue,
    }));

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND',
        }).format(amount);
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                        <BarChart3 className="w-7 h-7 text-blue-600" />
                        Phân tích doanh thu
                    </h1>
                    <p className="text-gray-500 mt-1">Theo dõi doanh thu và hiệu suất khóa học</p>
                </div>
            </div>

            {/* Course Selector */}
            <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
                <label className="block text-sm font-medium text-gray-700 mb-2">Chọn khóa học</label>
                {coursesLoading ? (
                    <div className="flex items-center gap-2 text-gray-500">
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Đang tải...
                    </div>
                ) : (
                    <select
                        value={selectedCourseId}
                        onChange={(e) => setSelectedCourseId(e.target.value)}
                        className="w-full max-w-md px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                    >
                        <option value="">-- Chọn khóa học --</option>
                        {courses.map((course) => (
                            <option key={course.courseId} value={course.courseId}>
                                {course.title}
                            </option>
                        ))}
                    </select>
                )}
            </div>

            {/* Stats & Chart */}
            {selectedCourseId && (
                <>
                    {revenueLoading ? (
                        <div className="flex items-center justify-center py-12">
                            <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
                        </div>
                    ) : revenue ? (
                        <>
                            {/* Stats Grid */}
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                                <StatCard
                                    title="Tổng doanh thu"
                                    value={formatCurrency(revenue.totalRevenue)}
                                    icon={DollarSign}
                                    color="text-green-600"
                                    bgColor="bg-green-100"
                                />
                                <StatCard
                                    title="Tổng học viên"
                                    value={revenue.totalEnrollments}
                                    icon={Users}
                                    color="text-purple-600"
                                    bgColor="bg-purple-100"
                                />
                                <StatCard
                                    title="Số thanh toán"
                                    value={revenue.totalPayments}
                                    icon={CreditCard}
                                    color="text-blue-600"
                                    bgColor="bg-blue-100"
                                />
                                <StatCard
                                    title="Giá trung bình"
                                    value={formatCurrency(revenue.averagePrice)}
                                    icon={TrendingUp}
                                    color="text-orange-600"
                                    bgColor="bg-orange-100"
                                />
                            </div>

                            {/* Revenue Chart */}
                            <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
                                <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                                    <TrendingUp className="w-5 h-5 text-blue-500" />
                                    Biểu đồ doanh thu theo tháng
                                </h2>
                                <div className="h-80">
                                    <ResponsiveContainer width="100%" height="100%" minHeight={320}>
                                        <AreaChart data={chartData}>
                                            <defs>
                                                <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                                                    <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.1} />
                                                    <stop offset="95%" stopColor="#3B82F6" stopOpacity={0} />
                                                </linearGradient>
                                            </defs>
                                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                                            <XAxis
                                                dataKey="month"
                                                axisLine={false}
                                                tickLine={false}
                                                tick={{ fill: '#9CA3AF' }}
                                            />
                                            <YAxis axisLine={false} tickLine={false} tick={{ fill: '#9CA3AF' }} />
                                            <Tooltip />
                                            <Area
                                                type="monotone"
                                                dataKey="revenue"
                                                stroke="#3B82F6"
                                                strokeWidth={3}
                                                fillOpacity={1}
                                                fill="url(#colorRevenue)"
                                            />
                                        </AreaChart>
                                    </ResponsiveContainer>
                                </div>
                                <p className="text-sm text-gray-400 mt-2 text-center">
                                    * Dữ liệu biểu đồ sẽ được cập nhật trong phiên bản tiếp theo
                                </p>
                            </div>
                        </>
                    ) : (
                        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-12 text-center">
                            <DollarSign className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                            <p className="text-gray-500">Không có dữ liệu doanh thu</p>
                        </div>
                    )}
                </>
            )}

            {/* Empty state when no course selected */}
            {!selectedCourseId && (
                <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-12 text-center">
                    <BarChart3 className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                    <p className="text-gray-500">Chọn một khóa học để xem phân tích doanh thu</p>
                </div>
            )}
        </div>
    );
};
