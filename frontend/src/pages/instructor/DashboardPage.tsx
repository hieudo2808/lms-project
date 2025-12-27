import { useNavigate } from 'react-router-dom';
import { useQuery } from '@apollo/client';
import { DollarSign, Users, BookOpen, Star, TrendingUp, Loader2, BookX, Edit3 } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

// Import queries
import { INSTRUCTOR_DASHBOARD_QUERY } from '../../graphql/queries/dashboard';
import { GET_MONTHLY_REVENUE } from '../../graphql/queries/instructor';

const StatCard = ({ title, value, icon: Icon, color, subtext }: any) => (
    <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
        <div className="flex items-center justify-between mb-4">
            <div className={`p-3 rounded-lg ${color}`}>
                <Icon className="w-6 h-6 text-white" />
            </div>
        </div>
        <h3 className="text-gray-500 text-sm font-medium">{title}</h3>
        <p className="text-2xl font-bold text-gray-800 mt-1">{value}</p>
        {subtext && <p className="text-xs text-gray-400 mt-1">{subtext}</p>}
    </div>
);

export const DashboardPage = () => {
    const navigate = useNavigate();

    const { data, loading, error } = useQuery(INSTRUCTOR_DASHBOARD_QUERY, {
        fetchPolicy: 'network-only',
    });

    const { data: revenueData } = useQuery(GET_MONTHLY_REVENUE, {
        variables: { months: 7 },
        fetchPolicy: 'network-only',
    });

    const chartData = (revenueData?.getMonthlyRevenue || []).map((item: any) => ({
        name: item.month.replace(/ \d{4}$/, ''),
        income: item.revenue,
    }));

    if (loading)
        return (
            <div className="flex h-[80vh] items-center justify-center">
                <Loader2 className="animate-spin text-blue-600 w-8 h-8" />
            </div>
        );

    // Hiển thị lỗi chi tiết nếu có
    if (error)
        return (
            <div className="p-8 text-center">
                <div className="bg-red-50 text-red-600 p-4 rounded-lg inline-block">
                    <p className="font-bold">Lỗi tải dữ liệu Dashboard</p>
                    <p className="text-sm">{error.message}</p>
                </div>
            </div>
        );

    const user = data?.me;
    const courses = data?.getMyCourses || [];

    // --- TÍNH TOÁN CHỈ SỐ ---
    const totalCourses = courses.length;
    const publishedCourses = courses.filter((c: any) => c.isPublished).length;
    const draftCourses = totalCourses - publishedCourses;

    // Sắp xếp: Lấy 5 khóa học mới nhất trong danh sách (vì đã bỏ trường updatedAt do lỗi Backend)
    const recentCourses = [...courses].slice(-5).reverse();

    return (
        <div className="space-y-8 max-w-7xl mx-auto">
            {/* Welcome Section */}
            <div className="flex justify-between items-end">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800">Xin chào, {user?.fullName || 'Giảng viên'}! 👋</h1>
                    <p className="text-gray-500 mt-1">Dưới đây là tổng quan hoạt động của bạn trên hệ thống.</p>
                </div>
                <button
                    onClick={() => navigate('/instructor/create-course')}
                    className="bg-blue-600 text-white px-5 py-2.5 rounded-lg font-bold hover:bg-blue-700 transition-all shadow-md active:scale-95 flex items-center gap-2"
                >
                    Tạo khóa học mới
                </button>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard
                    title="Tổng khóa học"
                    value={totalCourses}
                    icon={BookOpen}
                    color="bg-orange-500"
                    subtext={`${publishedCourses} Đang công khai, ${draftCourses} Bản nháp`}
                />
                <StatCard
                    title="Học viên"
                    value={data?.getTotalStudentsCount ?? 0}
                    icon={Users}
                    color="bg-purple-500"
                    subtext="Học viên đã đăng ký"
                />
                <StatCard
                    title="Tổng doanh thu"
                    value="0đ"
                    icon={DollarSign}
                    color="bg-blue-500"
                    subtext="Tất cả thời gian"
                />
                <StatCard
                    title="Đánh giá TB"
                    value="--/5.0"
                    icon={Star}
                    color="bg-yellow-500"
                    subtext="Chưa có đánh giá"
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Biểu đồ doanh thu */}
                <div className="lg:col-span-2 bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                            <TrendingUp className="w-5 h-5 text-blue-500" />
                            Biểu đồ doanh thu
                        </h2>
                    </div>
                    <div className="h-80 w-full">
                        <ResponsiveContainer width="100%" height="100%" minHeight={320}>
                            <AreaChart data={chartData}>
                                <defs>
                                    <linearGradient id="colorIncome" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.1} />
                                        <stop offset="95%" stopColor="#3B82F6" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#9CA3AF' }} />
                                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#9CA3AF' }} />
                                <Tooltip />
                                <Area
                                    type="monotone"
                                    dataKey="income"
                                    stroke="#3B82F6"
                                    strokeWidth={3}
                                    fillOpacity={1}
                                    fill="url(#colorIncome)"
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Khóa học gần đây */}
                <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm flex flex-col">
                    <h2 className="text-lg font-bold text-gray-800 mb-6">Khóa học gần đây</h2>

                    <div className="space-y-6 flex-1">
                        {recentCourses.length > 0 ? (
                            recentCourses.map((course: any) => (
                                <div
                                    key={course.courseId}
                                    className="flex items-start gap-4 group cursor-pointer"
                                    onClick={() => navigate(`/instructor/courses/${course.slug}/edit`)}
                                >
                                    <div className="w-12 h-12 rounded-lg bg-gray-100 flex items-center justify-center text-gray-400 group-hover:bg-blue-50 group-hover:text-blue-500 transition-colors shrink-0">
                                        {course.thumbnailUrl ? (
                                            <img
                                                src={course.thumbnailUrl}
                                                className="w-full h-full object-cover rounded-lg"
                                                alt=""
                                            />
                                        ) : (
                                            <BookOpen size={20} />
                                        )}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm text-gray-800 font-bold truncate">{course.title}</p>
                                        <p className="text-xs text-gray-400 mt-1 flex items-center gap-2">
                                            <span
                                                className={
                                                    course.isPublished
                                                        ? 'text-green-600 font-medium'
                                                        : 'text-gray-500 font-medium'
                                                }
                                            >
                                                {course.isPublished ? 'Công khai' : 'Bản nháp'}
                                            </span>
                                            <span>• {course.totalLessons || 0} bài</span>
                                        </p>
                                    </div>
                                    <Edit3
                                        size={16}
                                        className="text-gray-300 group-hover:text-blue-500 shrink-0 mt-1"
                                    />
                                </div>
                            ))
                        ) : (
                            <div className="py-10 text-center text-gray-400">
                                <BookX size={40} className="mx-auto mb-2 opacity-20" />
                                <p className="text-sm font-medium">Chưa có khóa học nào</p>
                            </div>
                        )}
                    </div>

                    <button
                        onClick={() => navigate('/instructor/my-courses')}
                        className="w-full mt-6 py-2 text-sm text-blue-600 font-medium hover:bg-blue-50 rounded-lg transition-colors border border-blue-100"
                    >
                        Quản lý tất cả khóa học
                    </button>
                </div>
            </div>
        </div>
    );
};
