import React, { useState } from 'react';
import { useQuery } from '@apollo/client';
import { useNavigate } from 'react-router-dom';
import { Layout } from '../../components/common/Layout';
import { CourseList } from '../../components/common/CourseList';
import { BookOpen, TrendingUp, Award } from 'lucide-react';
import type { Course } from '../../types';
import { GET_MY_ENROLLMENTS } from '../../graphql/queries/course';

type MyCourse = Course & {
  progressPercent: number;
};

export const StudentDashboardPage = () => {
  const navigate = useNavigate();
  const { data, loading, error } = useQuery(GET_MY_ENROLLMENTS);
  const [filterStatus, setFilterStatus] = useState<'all' | 'ongoing' | 'completed'>('all');

  const courses: MyCourse[] =
    data?.myEnrollments?.map((e: Record<string, any>) => ({
      courseId: e.course.courseId,
      id: e.course.courseId,
      title: e.course.title,
      slug: e.course.slug,
      thumbnailUrl: e.course.thumbnailUrl || 'https://via.placeholder.com/400x300',
      instructor: e.course.instructor
        ? {
            userId: e.course.instructor.userId,
            fullName: e.course.instructor.fullName,
            avatarUrl: e.course.instructor.avatarUrl,
          }
        : null,
      level: e.course.level,
      totalDuration: e.course.totalDuration || 0,
      totalLessons: e.course.totalLessons || 0,
      progressPercent: e.progressPercent || 0,
      price: 0,
      rating: 5,
      enrolledCount: 0,
      description: '',
      isPublished: true,
    })) || [];

  const filteredCourses = courses.filter((c) => {
    if (filterStatus === 'all') return true;
    if (filterStatus === 'ongoing') return c.progressPercent < 100;
    if (filterStatus === 'completed') return c.progressPercent >= 100;
    return true;
  });

  const totalCourses = courses.length;
  const avgProgress =
    totalCourses === 0
      ? 0
      : Math.round(
          courses.reduce((sum, c) => sum + (c.progressPercent || 0), 0) / totalCourses
        );
  const completedCount = courses.filter((c) => c.progressPercent >= 100).length;
  const continueCourse = filteredCourses[0];

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 py-10 space-y-8">
        {/* Hero */}
        <div className="bg-gradient-to-r from-blue-700 via-blue-600 to-indigo-600 text-white rounded-2xl p-8 shadow-lg flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div>
            <p className="text-sm uppercase tracking-widest text-blue-100">Bảng điều khiển học viên</p>
            <h1 className="text-3xl md:text-4xl font-bold mt-2">Khóa học của tôi</h1>
            <p className="text-blue-100 mt-2">Tiếp tục hành trình học tập với giao diện thống nhất và chuyên nghiệp.</p>
          </div>
          {continueCourse && (
            <div className="bg-white/10 border border-white/20 rounded-xl p-4 min-w-[240px]">
              <p className="text-sm text-blue-100">Tiếp tục học</p>
              <p className="font-bold text-lg leading-snug mt-1 line-clamp-2">{continueCourse.title}</p>
              <div className="w-full bg-white/30 rounded-full h-2 mt-3">
                <div
                  className="bg-white h-2 rounded-full"
                  style={{ width: `${continueCourse.progressPercent || 0}%` }}
                ></div>
              </div>
              <button
                onClick={() => navigate(`/courses/${continueCourse.slug}`)}
                className="mt-3 w-full bg-white text-blue-700 font-semibold py-2 rounded-lg shadow-sm hover:-translate-y-0.5 transition-transform"
              >
                Vào học ngay
              </button>
            </div>
          )}
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            {
              title: 'Khóa học đăng ký',
              value: totalCourses,
              icon: BookOpen,
              color: 'bg-blue-500',
              tone: 'text-blue-600',
            },
            {
              title: 'Tiến độ trung bình',
              value: `${avgProgress}%`,
              icon: TrendingUp,
              color: 'bg-amber-500',
              tone: 'text-amber-600',
            },
            {
              title: 'Đã hoàn thành',
              value: completedCount,
              icon: Award,
              color: 'bg-purple-500',
              tone: 'text-purple-600',
            },
          ].map((card) => (
            <div
              key={card.title}
              className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="flex items-center justify-between mb-4">
                <div className={`p-3 rounded-lg ${card.color}`}>
                  <card.icon className="w-6 h-6 text-white" />
                </div>
              </div>
              <p className="text-gray-500 text-sm font-medium">{card.title}</p>
              <p className={`text-3xl font-bold mt-1 ${card.tone}`}>{card.value}</p>
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
            <div className="text-center py-12">
              <div className="inline-block">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
              </div>
              <p className="text-gray-600 mt-4">Đang tải...</p>
            </div>
          )}

          {error && (
            <div className="p-4 bg-red-50 text-red-700 rounded border border-red-200">
              Lỗi tải dữ liệu: {error.message}. <br />
              <small>Nếu lỗi 500, vui lòng đăng xuất và đăng nhập lại.</small>
            </div>
          )}

          {!loading && !error && filteredCourses.length === 0 && (
            <div className="text-center py-12 bg-gray-50 rounded-lg">
              <BookOpen className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 text-lg mb-4">
                {filterStatus === 'all'
                  ? 'Bạn chưa đăng ký khóa học nào.'
                  : filterStatus === 'ongoing'
                  ? 'Bạn không có khóa học nào đang học.'
                  : 'Bạn chưa hoàn thành khóa học nào.'}
              </p>
              <button
                onClick={() => navigate('/')}
                className="text-blue-600 hover:underline font-medium"
              >
                Khám phá khóa học ngay
              </button>
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
