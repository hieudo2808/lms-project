import { useState, useEffect } from 'react';
import { Layout } from '../components/Layout';
import { CourseList } from '../components/CourseList';
import type { Course } from '../types';

export const MyCoursesPage = () => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<'all' | 'ongoing' | 'completed'>('all');

  // Mock data - sẽ được thay thế bằng API call /me/courses
  const mockCourses: Course[] = [
    {
      id: '1',
      title: 'React + TypeScript từ Zero đến Hero',
      slug: 'react-typescript-zero-hero',
      description: 'Học React và TypeScript từ cơ bản đến nâng cao',
      thumbnail: 'https://via.placeholder.com/400x300?text=React+Course',
      instructor: 'Nguyễn Văn A',
      level: 'beginner',
      duration: 450,
      lessonsCount: 25,
      rating: 4.8,
      enrolledCount: 2500,
    },
    {
      id: '3',
      title: 'Python cho Data Science',
      slug: 'python-data-science',
      description: 'Khám phá Data Science với Python',
      thumbnail: 'https://via.placeholder.com/400x300?text=Python+Course',
      instructor: 'Lê Hoàng C',
      level: 'intermediate',
      duration: 520,
      lessonsCount: 28,
      rating: 4.7,
      enrolledCount: 3200,
    },
  ];

  useEffect(() => {
    // Simulate API call: GET /me/courses
    const timer = setTimeout(() => {
      setCourses(mockCourses);
      setIsLoading(false);
    }, 500);

    return () => clearTimeout(timer);
  }, []);

  const filteredCourses = courses.filter(() => {
    if (filterStatus === 'all') return true;
    if (filterStatus === 'ongoing') return true; // TODO: Add logic based on progress
    if (filterStatus === 'completed') return false; // TODO: Add logic based on completion
    return true;
  });

  return (
    <Layout>
      {/* Header */}
      <section className="bg-gradient-to-r from-blue-600 to-blue-800 text-white py-12">
        <div className="max-w-7xl mx-auto px-4">
          <h1 className="text-4xl font-bold mb-2">Dashboard</h1>
          <p className="text-blue-100">Quản lý các khóa học của bạn</p>
        </div>
      </section>

      {/* Stats */}
      <section className="bg-white shadow-md py-8">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="text-center">
              <p className="text-4xl font-bold text-blue-600">{courses.length}</p>
              <p className="text-gray-600">Khóa học đã tham gia</p>
            </div>
            <div className="text-center">
              <p className="text-4xl font-bold text-green-600">
                {Math.floor(Math.random() * 50) + 10}
              </p>
              <p className="text-gray-600">Giờ học tập</p>
            </div>
            <div className="text-center">
              <p className="text-4xl font-bold text-yellow-600">75%</p>
              <p className="text-gray-600">Tiến độ trung bình</p>
            </div>
            <div className="text-center">
              <p className="text-4xl font-bold text-purple-600">
                {Math.floor(Math.random() * 5) + 1}
              </p>
              <p className="text-gray-600">Chứng chỉ hoàn thành</p>
            </div>
          </div>
        </div>
      </section>

      {/* Filter */}
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

      {/* Courses */}
      <section className="max-w-7xl mx-auto px-4 py-12">
        <CourseList courses={filteredCourses} isLoading={isLoading} />
      </section>
    </Layout>
  );
};
