import { useState } from 'react';
import { useQuery } from '@apollo/client';
import { Layout } from '../../components/common/Layout';
import { CourseList } from '../../components/common/CourseList';
import type { Course } from '../../types';
import { GET_MY_ENROLLMENTS } from '../../graphql/queries/course';

type MyCourse = Course & {
  progressPercent: number; 
};

export const MyCoursesPage = () => {
  const { data, loading, error } = useQuery(GET_MY_ENROLLMENTS);
  const [filterStatus, setFilterStatus] = useState<'all' | 'ongoing' | 'completed'>('all');

  const courses: MyCourse[] = data?.myEnrollments?.map((e: any) => ({
    id: e.course.courseId,
    courseId: e.course.courseId, 
    
    title: e.course.title,
    slug: e.course.slug,
    thumbnailUrl: e.course.thumbnailUrl || 'https://via.placeholder.com/400x300',
    
    instructor: e.course.instructor ? {
        userId: e.course.instructor.userId,
        fullName: e.course.instructor.fullName,
        avatarUrl: e.course.instructor.avatarUrl
    } : null,
    
    level: e.course.level,
    
    totalDuration: e.course.totalDuration || 0,
    totalLessons: e.course.totalLessons || 0,
    
    progressPercent: e.progressPercent || 0,
    
    price: 0,
    rating: 5,
    enrolledCount: 0,
    description: '',
    isPublished: true
  })) || [];

  const filteredCourses = courses.filter((c) => {
    if (filterStatus === 'all') return true;
    if (filterStatus === 'ongoing') return c.progressPercent < 100;
    if (filterStatus === 'completed') return c.progressPercent >= 100;
    return true;
  });

  const totalCourses = courses.length;
  const avgProgress = totalCourses === 0 ? 0 : Math.round(courses.reduce((sum, c) => sum + (c.progressPercent || 0), 0) / totalCourses);
  const completedCount = courses.filter((c) => c.progressPercent >= 100).length;

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 py-10 space-y-8">
        {/* Hero */}
        <div className="bg-gradient-to-r from-blue-700 via-blue-600 to-indigo-600 text-white rounded-2xl p-8 shadow-lg flex flex-col gap-3">
          <p className="text-sm uppercase tracking-widest text-blue-100">Học viên</p>
          <h1 className="text-3xl md:text-4xl font-bold">Khoá học của tôi</h1>
          <p className="text-blue-100">Tiếp tục hành trình học tập với giao diện đồng nhất, chuyên nghiệp.</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[ 
            { label: 'Khóa học đã tham gia', value: totalCourses, color: 'text-blue-600', bg: 'bg-blue-500' },
            { label: 'Tiến độ trung bình', value: `${avgProgress}%`, color: 'text-amber-600', bg: 'bg-amber-500' },
            { label: 'Hoàn thành', value: completedCount, color: 'text-purple-600', bg: 'bg-purple-500' },
          ].map((item) => (
            <div key={item.label} className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between mb-3">
                <div className={`w-10 h-10 rounded-lg ${item.bg} opacity-90`}></div>
              </div>
              <p className="text-sm text-gray-500 font-medium">{item.label}</p>
              <p className={`text-3xl font-bold mt-1 ${item.color}`}>{item.value}</p>
            </div>
          ))}
        </div>

        {/* Filters */}
        <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm flex flex-wrap gap-3 items-center justify-between">
          <div className="font-semibold text-gray-800">Lọc khóa học</div>
          <div className="flex gap-3 flex-wrap">
            {[
              { key: 'all', label: 'Tất cả' },
              { key: 'ongoing', label: 'Đang học' },
              { key: 'completed', label: 'Hoàn thành' },
            ].map((item) => (
              <button
                key={item.key}
                onClick={() => setFilterStatus(item.key as 'all' | 'ongoing' | 'completed')}
                className={`px-4 py-2 rounded-full text-sm font-semibold transition-all border ${
                  filterStatus === item.key
                    ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                    : 'bg-white text-gray-700 border-gray-200 hover:border-blue-400'
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>

        {/* Course List */}
        <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
          {loading && (
            <div className="text-center py-10 text-gray-500">Đang tải...</div>
          )}

          {error && (
            <div className="p-4 bg-red-50 text-red-700 rounded border border-red-200">
              Lỗi tải dữ liệu: {error.message}. <br />
              <small>Nếu lỗi 500, vui lòng Đăng xuất và Đăng nhập lại.</small>
            </div>
          )}

          {!loading && !error && filteredCourses.length === 0 && (
            <div className="text-center py-10">
              <p className="text-gray-500 mb-4">Bạn chưa đăng ký khóa học nào.</p>
              <a href="/" className="text-blue-600 hover:underline">Khám phá khóa học ngay</a>
            </div>
          )}

          {!loading && !error && (
            <div className="mt-4">
              <CourseList courses={filteredCourses} isLoading={false} />
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};