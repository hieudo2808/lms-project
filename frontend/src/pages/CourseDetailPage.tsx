import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Layout } from '../components/Layout';
import type { CourseDetail } from '../types';
import { CourseHero } from '../components/course/CourseHero';
import { CourseInfo } from '../components/course/CourseInfo';
import { CourseLessonList } from '../components/course/CourseLessonList';
import { CourseSidebar } from '../components/course/CourseSidebar';
import { CourseReviews } from '../components/course/CourseReviews';
import { useAuthStore } from '../lib/store';

export const CourseDetailPage = () => {
  const { slug } = useParams<{ slug: string }>();
  const { auth } = useAuthStore();

  const [course, setCourse] = useState<CourseDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isEnrolled, setIsEnrolled] = useState(false);
  const [isEnrollLoading, setIsEnrollLoading] = useState(false);
  const [enrollError, setEnrollError] = useState<string | null>(null);

  const mockCourse: CourseDetail = {
    id: '1',
    title: 'React + TypeScript từ Zero đến Hero',
    slug: 'react-typescript-zero-hero',
    description: 'Học React và TypeScript từ cơ bản đến nâng cao',
    thumbnailUrl: 'https://via.placeholder.com/800x400?text=React+Course',
    instructorId: 'instructor-1',
    instructorName: 'Nguyễn Văn A',
    level: 'beginner',
    price: 0, 
    categoryId: undefined,
    categoryName: undefined,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    isPublished: true,
    lessonsCount: 5,
    totalDurationSeconds: (15 + 20 + 25 + 20 + 30) * 60,
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
        moduleId: undefined,
        title: 'Giới thiệu về React',
        videoUrl: 'https://example.com/lesson1.mp4',
        content: 'Tìm hiểu cơ bản về React',
        durationSeconds: 15 * 60,
        order: 1,
      },
      {
        id: '2',
        moduleId: undefined,
        title: 'JSX và Components',
        videoUrl: 'https://example.com/lesson2.mp4',
        content: 'Học về JSX syntax và cách tạo components',
        durationSeconds: 20 * 60,
        order: 2,
      },
      {
        id: '3',
        moduleId: undefined,
        title: 'React Hooks - useState',
        videoUrl: 'https://example.com/lesson3.mp4',
        content: 'Quản lý state với useState hook',
        durationSeconds: 25 * 60,
        order: 3,
      },
      {
        id: '4',
        moduleId: undefined,
        title: 'React Hooks - useEffect',
        videoUrl: 'https://example.com/lesson4.mp4',
        content: 'Side effects với useEffect hook',
        durationSeconds: 20 * 60,
        order: 4,
      },
      {
        id: '5',
        moduleId: undefined,
        title: 'TypeScript Basics',
        videoUrl: 'https://example.com/lesson5.mp4',
        content: 'Giới thiệu TypeScript',
        durationSeconds: 30 * 60,
        order: 5,
      },
    ],
  };

  // load course (mock)
  useEffect(() => {
    const timer = setTimeout(() => {
      if (slug === 'react-typescript-zero-hero') {
        setCourse(mockCourse);
      }
      setIsLoading(false);
    }, 500);

    return () => clearTimeout(timer);
  }, [slug]);

  const handleEnroll = async () => {
    if (!course) return;

    if (!auth?.user) {
      alert('Vui lòng đăng nhập trước khi đăng ký khóa học.');
      return;
    }

    try {
      setIsEnrollLoading(true);
      setEnrollError(null);

      if (course.price === 0) {
        // khóa miễn phí
        await new Promise((res) => setTimeout(res, 400));
        setIsEnrolled(true);
      } else {
        // khóa có phí – mock thanh toán
        const ok = window.confirm(
          `Thanh toán giả lập ${course.price.toLocaleString()}₫ cho khóa học này?`
        );
        if (!ok) return;

        await new Promise((res) => setTimeout(res, 800));
        setIsEnrolled(true);
        alert('Thanh toán giả lập thành công, bạn đã được đăng ký khóa học.');
      }
    } catch (err) {
      console.error(err);
      setEnrollError('Đăng ký khóa học thất bại. Vui lòng thử lại.');
    } finally {
      setIsEnrollLoading(false);
    }
  };

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
          <Link
            to="/"
            className="text-blue-600 hover:underline mt-4 inline-block"
          >
            Quay lại trang chủ
          </Link>
        </div>
      </Layout>
    );
  }

  const totalMinutes = Math.round(course.totalDurationSeconds / 60);
  const totalHours = Math.floor(totalMinutes / 60);

  return (
    <Layout>
      <CourseHero course={course} totalHours={totalHours} />

      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <CourseInfo course={course} totalHours={totalHours} />
            <CourseLessonList course={course} />
            <CourseReviews courseId={course.id} isEnrolled={isEnrolled} />
          </div>

          <div className="lg:col-span-1">
            <CourseSidebar
              course={course}
              totalHours={totalHours}
              isEnrolled={isEnrolled}
              isEnrollLoading={isEnrollLoading}
              enrollError={enrollError}
              onEnroll={handleEnroll}
            />
          </div>
        </div>
      </div>
    </Layout>
  );
};
