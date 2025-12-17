import { useState } from 'react';
import { useQuery } from '@apollo/client';
import { Layout } from '../components/Layout';
import { CourseList } from '../components/CourseList';
import type { Course } from '../types';
import { GET_MY_ENROLLMENTS } from '../graphql/queries/course';

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
      <section className="bg-gradient-to-r from-blue-600 to-blue-800 text-white py-12">
        <div className="max-w-7xl mx-auto px-4">
          <h1 className="text-4xl font-bold mb-2">Khoá học của tôi</h1>
          <p className="text-blue-100">Tiếp tục hành trình học tập của bạn</p>
        </div>
      </section>

      {/* Stats Section */}
      <section className="bg-white shadow-md py-8">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <p className="text-4xl font-bold text-blue-600">{totalCourses}</p>
              <p className="text-gray-600">Khóa học đã tham gia</p>
            </div>
            <div className="text-center">
              <p className="text-4xl font-bold text-yellow-600">{avgProgress}%</p>
              <p className="text-gray-600">Tiến độ trung bình</p>
            </div>
            <div className="text-center">
              <p className="text-4xl font-bold text-purple-600">{completedCount}</p>
              <p className="text-gray-600">Khóa học hoàn thành</p>
            </div>
          </div>
        </div>
      </section>

      {/* Filter Buttons */}
      <section className="bg-gray-100 py-6">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex gap-4">
            <button
              onClick={() => setFilterStatus('all')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${filterStatus === 'all' ? 'bg-blue-600 text-white' : 'bg-white text-gray-800 hover:bg-gray-200'}`}
            >
              Tất cả
            </button>
            <button
              onClick={() => setFilterStatus('ongoing')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${filterStatus === 'ongoing' ? 'bg-blue-600 text-white' : 'bg-white text-gray-800 hover:bg-gray-200'}`}
            >
              Đang học
            </button>
            <button
              onClick={() => setFilterStatus('completed')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${filterStatus === 'completed' ? 'bg-blue-600 text-white' : 'bg-white text-gray-800 hover:bg-gray-200'}`}
            >
              Hoàn thành
            </button>
          </div>
        </div>
      </section>

      {/* Course List */}
      <section className="max-w-7xl mx-auto px-4 py-12">
        {loading && <p>Đang tải...</p>}
        {error && (
            <div className="p-4 bg-red-100 text-red-700 rounded border border-red-300">
                Lỗi tải dữ liệu: {error.message}. <br/>
                <small>Nếu lỗi 500, vui lòng Đăng xuất và Đăng nhập lại.</small>
            </div>
        )}
        
        {!loading && !error && filteredCourses.length === 0 && (
            <div className="text-center py-10">
                <p className="text-gray-500 mb-4">Bạn chưa đăng ký khóa học nào.</p>
                <a href="/" className="text-blue-600 hover:underline">Khám phá khóa học ngay</a>
            </div>
        )}
        
        {!loading && !error && <CourseList courses={filteredCourses} isLoading={false} />}
      </section>
    </Layout>
  );
};