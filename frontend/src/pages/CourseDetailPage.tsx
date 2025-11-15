import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Layout } from '../components/Layout';
import type { CourseDetail } from '../types';

export const CourseDetailPage = () => {
  const { slug } = useParams<{ slug: string }>();
  const [course, setCourse] = useState<CourseDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isEnrolled, setIsEnrolled] = useState(false);

  // Mock data - sẽ được thay thế bằng API call
  const mockCourse: CourseDetail = {
    id: '1',
    title: 'React + TypeScript từ Zero đến Hero',
    slug: 'react-typescript-zero-hero',
    description: 'Học React và TypeScript từ cơ bản đến nâng cao',
    thumbnail: 'https://via.placeholder.com/800x400?text=React+Course',
    instructor: 'Nguyễn Văn A',
    level: 'beginner',
    duration: 450,
    lessonsCount: 25,
    rating: 4.8,
    enrolledCount: 2500,
    fullDescription: `
      Khóa học React + TypeScript toàn diện từ cơ bản đến nâng cao. 
      Bạn sẽ học được:
      - React Hooks và functional components
      - TypeScript basics và advanced types
      - State management với Redux
      - Routing với React Router
      - API integration
      - Testing with Jest
      - Deployment strategies
    `,
    lessons: [
      {
        id: '1',
        title: 'Giới thiệu về React',
        duration: 15,
        videoUrl: 'https://example.com/lesson1.mp4',
        description: 'Tìm hiểu cơ bản về React',
        order: 1,
      },
      {
        id: '2',
        title: 'JSX và Components',
        duration: 20,
        videoUrl: 'https://example.com/lesson2.mp4',
        description: 'Học về JSX syntax và cách tạo components',
        order: 2,
      },
      {
        id: '3',
        title: 'React Hooks - useState',
        duration: 25,
        videoUrl: 'https://example.com/lesson3.mp4',
        description: 'Quản lý state với useState hook',
        order: 3,
      },
      {
        id: '4',
        title: 'React Hooks - useEffect',
        duration: 20,
        videoUrl: 'https://example.com/lesson4.mp4',
        description: 'Side effects với useEffect hook',
        order: 4,
      },
      {
        id: '5',
        title: 'TypeScript Basics',
        duration: 30,
        videoUrl: 'https://example.com/lesson5.mp4',
        description: 'Giới thiệu TypeScript',
        order: 5,
      },
    ],
  };

  useEffect(() => {
    // Simulate API call: GET /courses/{slug}
    const timer = setTimeout(() => {
      if (slug === 'react-typescript-zero-hero') {
        setCourse(mockCourse);
      }
      setIsLoading(false);
    }, 500);

    return () => clearTimeout(timer);
  }, [slug]);

  if (isLoading) {
    return (
      <Layout>
        <div className="max-w-7xl mx-auto px-4 py-12">
          <div className="animate-pulse">
            <div className="h-96 bg-gray-300 rounded-lg mb-8"></div>
            <div className="h-8 bg-gray-300 rounded w-1/2 mb-4"></div>
            <div className="h-4 bg-gray-300 rounded w-3/4 mb-2"></div>
            <div className="h-4 bg-gray-300 rounded w-2/3"></div>
          </div>
        </div>
      </Layout>
    );
  }

  if (!course) {
    return (
      <Layout>
        <div className="max-w-7xl mx-auto px-4 py-12 text-center">
          <p className="text-gray-500 text-lg">Khóa học không tìm thấy</p>
          <Link to="/" className="text-blue-600 hover:underline mt-4 inline-block">
            Quay lại trang chủ
          </Link>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      {/* Hero Section with Gradient */}
      <div className="relative w-full h-96 overflow-hidden bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600">
        <img
          src={course.thumbnail}
          alt={course.title}
          className="w-full h-full object-cover opacity-40"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent"></div>
        
        <div className="absolute bottom-0 left-0 right-0 text-white p-8">
          <div className="max-w-7xl mx-auto">
            <div className="inline-block mb-4">
              <span className="text-sm font-bold px-3 py-1 bg-yellow-500 text-black rounded-full">
                ⭐ {course.rating.toFixed(1)} · {course.enrolledCount}+ học viên
              </span>
            </div>
            <h1 className="text-5xl font-bold mb-4">{course.title}</h1>
            <p className="text-lg text-gray-200 mb-4">Gồm {course.lessonsCount} bài học · {Math.floor(course.duration / 60)} giờ</p>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 text-white">
                <span className="text-2xl">👤</span>
                <div>
                  <p className="font-semibold">{course.instructor}</p>
                  <p className="text-sm text-gray-300">Giáo viên</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {/* Mô tả khóa học */}
            <div className="mb-12">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Mô tả khóa học</h2>
              <p className="text-gray-700 leading-relaxed whitespace-pre-line">
                {course.fullDescription}
              </p>
            </div>

            {/* Danh sách bài học */}
            <div className="mb-12">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                📚 Danh sách bài học ({course.lessons.length})
              </h2>
              <div className="bg-gray-50 rounded-xl overflow-hidden border border-gray-200">
                {course.lessons.map((lesson, index) => (
                  <Link key={lesson.id} to={`/courses/${course.slug}/lesson/${lesson.id}`}>
                    <div className="border-b last:border-b-0 border-gray-200 p-4 hover:bg-blue-50 transition-colors cursor-pointer group">
                      <div className="flex items-center gap-4">
                        <div className="flex-shrink-0 w-12 h-12 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold">
                          {index + 1}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-gray-900 group-hover:text-blue-600">
                            {lesson.title}
                          </h3>
                          <p className="text-sm text-gray-600 line-clamp-1">
                            {lesson.description}
                          </p>
                        </div>
                        <div className="flex-shrink-0 text-right">
                          <p className="text-sm font-medium text-gray-600">
                            ⏱ {lesson.duration}m
                          </p>
                          <p className="text-xs text-gray-500 mt-1">▶ Xem</p>
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>

            {/* Thông tin thêm */}
            <div className="bg-blue-50 rounded-xl p-6 border border-blue-200">
              <h3 className="font-bold text-gray-900 mb-4">ℹ️ Thông tin khóa học</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600">Cấp độ</p>
                  <p className="font-semibold text-gray-900">
                    {course.level === 'beginner' && '🌱 Cơ bản'}
                    {course.level === 'intermediate' && '📈 Trung bình'}
                    {course.level === 'advanced' && '🚀 Nâng cao'}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Thời lượng</p>
                  <p className="font-semibold text-gray-900">{Math.floor(course.duration / 60)} giờ</p>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-xl p-6 sticky top-24 border border-gray-200">
              {/* Enroll Button */}
              <button
                onClick={() => setIsEnrolled(!isEnrolled)}
                className={`w-full py-3 px-4 rounded-lg font-bold text-lg transition-all mb-3 ${
                  isEnrolled
                    ? 'bg-gray-200 text-gray-800 hover:bg-gray-300'
                    : 'bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:shadow-lg hover:scale-105'
                }`}
              >
                {isEnrolled ? '✓ Đã đăng ký' : 'Đăng ký khóa học'}
              </button>

              {/* Start Learning Button */}
              {isEnrolled && (
                <Link to={`/courses/${course.slug}/lesson/${course.lessons[0]?.id || '1'}`}>
                  <button className="w-full py-3 px-4 rounded-lg font-bold text-lg bg-gradient-to-r from-green-500 to-emerald-600 text-white hover:shadow-lg transition-all">
                    🎬 Bắt đầu học
                  </button>
                </Link>
              )}

              {/* Course Stats */}
              <div className="mt-8 pt-6 border-t border-gray-200 space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">⭐ Đánh giá</span>
                  <span className="font-bold text-lg">{course.rating.toFixed(1)}/5</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">👥 Học viên</span>
                  <span className="font-bold">{course.enrolledCount.toLocaleString()}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">📚 Bài học</span>
                  <span className="font-bold">{course.lessonsCount}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">⏱ Thời lượng</span>
                  <span className="font-bold">{Math.floor(course.duration / 60)}h</span>
                </div>
              </div>

              {/* Instructor Card */}
              <div className="mt-8 pt-6 border-t border-gray-200">
                <p className="text-xs uppercase text-gray-500 font-bold mb-3">Giáo viên</p>
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white font-bold">
                    {course.instructor[0]}
                  </div>
                  <div>
                    <p className="font-bold text-gray-900">{course.instructor}</p>
                    <p className="text-xs text-gray-500">Chuyên gia</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};
