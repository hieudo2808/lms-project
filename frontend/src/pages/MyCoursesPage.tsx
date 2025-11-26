import { useState, useEffect } from 'react';
import { Layout } from '../components/Layout';
import { CourseList } from '../components/CourseList';
import type { Course } from '../types';
import { userAPI } from '../services/api';

// Course kèm progressPercent lấy từ Enrollments
type MyCourse = Course & {
  progressPercent: number; 
};

export const MyCoursesPage = () => {
  const [courses, setCourses] = useState<MyCourse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<'all' | 'ongoing' | 'completed'>('all');

  // MOCK 
  const mockCourses: MyCourse[] = [
    {
      id: '1',
      title: 'React + TypeScript từ Zero đến Hero',
      slug: 'react-typescript-zero-hero',
      description: 'Học React và TypeScript từ cơ bản đến nâng cao',
      thumbnailUrl: 'https://via.placeholder.com/400x300?text=React+Course',
      instructorId: 'instructor-1',
      instructorName: 'Nguyễn Văn A',
      level: 'beginner',
      price: 0,
      categoryId: undefined,
      categoryName: undefined,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      isPublished: true,
      lessonsCount: 25,
      totalDurationSeconds: 450 * 60, 
      rating: 4.8,
      enrolledCount: 2500,
      progressPercent: 40,            
    },
    {
      id: '2',
      title: 'Node.js Backend Pro',
      slug: 'nodejs-backend-pro',
      description: 'Xây dựng RESTful API với Node.js & Express',
      thumbnailUrl: 'https://via.placeholder.com/400x300?text=Node+Course',
      instructorId: 'instructor-2',
      instructorName: 'Trần Văn B',
      level: 'intermediate',
      price: 399000,
      categoryId: undefined,
      categoryName: undefined,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      isPublished: true,
      lessonsCount: 30,
      totalDurationSeconds: 600 * 60, 
      rating: 4.6,
      enrolledCount: 1800,
      progressPercent: 85,            
    },
    {
      id: '3',
      title: 'Python cho Data Science',
      slug: 'python-data-science',
      description: 'Khám phá Data Science với Python',
      thumbnailUrl: 'https://via.placeholder.com/400x300?text=Python+Course',
      instructorId: 'instructor-3',
      instructorName: 'Lê Hoàng C',
      level: 'intermediate',
      price: 0,
      categoryId: undefined,
      categoryName: undefined,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      isPublished: true,
      lessonsCount: 28,
      totalDurationSeconds: 520 * 60, 
      rating: 4.7,
      enrolledCount: 3200,
      progressPercent: 100,          
    },
  ];

  useEffect(() => {
    const fetchMyCourses = async () => {
      try {
        setIsLoading(true);

        // Nếu backend đã có /v1/me/courses (join Enrollments + Courses + progressPercent)
        const res = await userAPI.getCourses();
        // Giả sử BE trả về array MyCourse: [{ ...courseFields, progressPercent }]
        setCourses(res.data as MyCourse[]);
      } catch (err) {
        console.error('getCourses lỗi, dùng mock:', err);
        // FRONTEND DEMO: fallback mock
        setCourses(mockCourses);
      } finally {
        setIsLoading(false);
      }
    };

    fetchMyCourses();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const filteredCourses = courses.filter((c) => {
    if (filterStatus === 'all') return true;
    if (filterStatus === 'ongoing') return c.progressPercent > 0 && c.progressPercent < 100;
    if (filterStatus === 'completed') return c.progressPercent >= 100;
    return true;
  });

  const totalCourses = courses.length;
  const avgProgress =
    totalCourses === 0
      ? 0
      : Math.round(
          courses.reduce((sum, c) => sum + (c.progressPercent || 0), 0) /
            totalCourses
        );
  const completedCount = courses.filter((c) => c.progressPercent >= 100).length;

  const totalHoursLearned = Math.round(
    courses.reduce((sum, c) => {
      const learnedSeconds =
        ((c.totalDurationSeconds || 0) * (c.progressPercent || 0)) / 100;
      return sum + learnedSeconds / 3600;
    }, 0)
  );

  return (
    <Layout>
      <section className="bg-gradient-to-r from-blue-600 to-blue-800 text-white py-12">
        <div className="max-w-7xl mx-auto px-4">
          <h1 className="text-4xl font-bold mb-2">Dashboard</h1>
          <p className="text-blue-100">Quản lý các khóa học của bạn</p>
        </div>
      </section>

      <section className="bg-white shadow-md py-8">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="text-center">
              <p className="text-4xl font-bold text-blue-600">
                {totalCourses}
              </p>
              <p className="text-gray-600">Khóa học đã tham gia</p>
            </div>
            <div className="text-center">
              <p className="text-4xl font-bold text-green-600">
                {totalHoursLearned}
              </p>
              <p className="text-gray-600">Giờ học ước tính</p>
            </div>
            <div className="text-center">
              <p className="text-4xl font-bold text-yellow-600">
                {avgProgress}%
              </p>
              <p className="text-gray-600">Tiến độ trung bình</p>
            </div>
            <div className="text-center">
              <p className="text-4xl font-bold text-purple-600">
                {completedCount}
              </p>
              <p className="text-gray-600">Khóa học hoàn thành</p>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-gray-100 py-6">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex gap-4 flex-wrap">
            <button
              onClick={() => setFilterStatus('all')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                filterStatus === 'all'
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-gray-800 hover:bg-gray-200'
              }`}
            >
              Tất cả
            </button>
            <button
              onClick={() => setFilterStatus('ongoing')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                filterStatus === 'ongoing'
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-gray-800 hover:bg-gray-200'
              }`}
            >
              Đang học
            </button>
            <button
              onClick={() => setFilterStatus('completed')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                filterStatus === 'completed'
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-gray-800 hover:bg-gray-200'
              }`}
            >
              Hoàn thành
            </button>
          </div>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 py-12">
        {/* Nếu CourseList đã support hiển thị progressPercent thì chỉ cần truyền courses này.
           Nếu chưa, bạn có thể bổ sung prop showProgress hoặc chỉnh CourseCard đọc course.progressPercent. */}
        <CourseList courses={filteredCourses} isLoading={isLoading} />
      </section>
    </Layout>
  );
};
