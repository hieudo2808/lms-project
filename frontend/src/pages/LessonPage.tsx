import { useEffect, useRef, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Layout } from '../components/Layout';
import { VideoPlayer } from '../components/VideoPlayer';
import { Button } from '../components/Button';
import { lessonAPI, userAPI } from '../services/api';
import type { CourseDetail, Lesson, Progress } from '../types';
import { LessonProgress } from '../components/lesson/LessonProgress';
import { LessonDiscussion } from '../components/lesson/LessonDiscussion';
import { LessonResources } from '../components/lesson/LessonResources';
import { LessonSidebar } from '../components/lesson/LessonSidebar';

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
  fullDescription: '',
  lessons: [
    {
      id: '1',
      courseId: '1',
      moduleId: undefined,
      title: 'Giới thiệu về React',
      videoUrl:
        'https://commondatastorage.googleapis.com/gtv-videos-library/sample/BigBuckBunny.mp4',
      content: 'Tìm hiểu cơ bản về React',
      durationSeconds: 15 * 60,
      order: 1,
    },
    {
      id: '2',
      courseId: '1',
      moduleId: undefined,
      title: 'JSX và Components',
      videoUrl:
        'https://commondatastorage.googleapis.com/gtv-videos-library/sample/ElephantsDream.mp4',
      content: 'Học về JSX syntax và cách tạo components',
      durationSeconds: 20 * 60,
      order: 2,
    },
    {
      id: '3',
      courseId: '1',
      moduleId: undefined,
      title: 'React Hooks - useState',
      videoUrl:
        'https://commondatastorage.googleapis.com/gtv-videos-library/sample/ForBiggerBlazes.mp4',
      content: 'Quản lý state với useState hook',
      durationSeconds: 25 * 60,
      order: 3,
    },
    {
      id: '4',
      courseId: '1',
      moduleId: undefined,
      title: 'React Hooks - useEffect',
      videoUrl:
        'https://commondatastorage.googleapis.com/gtv-videos-library/sample/ForBiggerEscapes.mp4',
      content: 'Side effects với useEffect hook',
      durationSeconds: 20 * 60,
      order: 4,
    },
    {
      id: '5',
      courseId: '1',
      moduleId: undefined,
      title: 'TypeScript Basics',
      videoUrl:
        'https://commondatastorage.googleapis.com/gtv-videos-library/sample/ForBiggerFun.mp4',
      content: 'Giới thiệu TypeScript',
      durationSeconds: 30 * 60,
      order: 5,
    },
  ],
};

export const LessonPage = () => {
  const { slug, id } = useParams<{ slug: string; id: string }>();
  const navigate = useNavigate();

  const [course, setCourse] = useState<CourseDetail | null>(null);
  const [currentLesson, setCurrentLesson] = useState<Lesson | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const [progress, setProgress] = useState<Progress | null>(null);
  const lastProgressSavedRef = useRef(0);

  // chỉ xem video khi đã enroll
  const [isCheckingEnroll, setIsCheckingEnroll] = useState(false);
  const [isEnrolled, setIsEnrolled] = useState(false);

  // Load course + lesson (mock – sau này thay bằng API course/lesson thật)
  useEffect(() => {
    const timer = setTimeout(() => {
      if (slug === 'react-typescript-zero-hero') {
        setCourse(mockCourse);
        setCurrentLesson(
          mockCourse.lessons.find((l) => l.id === id) || null
        );
      }
      setIsLoading(false);
    }, 500);

    return () => clearTimeout(timer);
  }, [slug, id]);

  // Check đã enroll course chưa (dùng /v1/me/courses)
  useEffect(() => {
    const checkEnroll = async () => {
      if (!course) return;
      try {
        setIsCheckingEnroll(true);
        const res = await userAPI.getCourses();
        const myCourses = res.data as { id: string; slug: string }[];

        const enrolled = myCourses.some(
          (c) => c.id === course.id || c.slug === course.slug
        );
        setIsEnrolled(enrolled);
      } catch (err) {
        console.error('Failed to check enrollment', err);
        // Dev mode: cho xem luôn để demo giao diện.
        // Khi backend xong, có thể đổi thành setIsEnrolled(false);
        setIsEnrolled(true);
      } finally {
        setIsCheckingEnroll(false);
      }
    };

    checkEnroll();
  }, [course]);

  const handleProgressUpdate = (newProgress: Progress) => {
    setProgress(newProgress);

    const now = Date.now();
    if (now - lastProgressSavedRef.current >= 30000 && id) {
      lastProgressSavedRef.current = now;
      lessonAPI
        .saveProgress(
          id,
          newProgress.watchedSeconds,
          newProgress.totalSeconds
        )
        .catch(() => console.error('Failed to save progress'));
    }
  };

  const idx = course?.lessons.findIndex((l) => l.id === id) ?? -1;
  const prevLesson = idx > 0 ? course?.lessons[idx - 1] : null;
  const nextLesson =
    idx >= 0 && idx < (course?.lessons.length ?? 0) - 1
      ? course?.lessons[idx + 1]
      : null;

  if (isLoading) {
    return (
      <Layout>
        <div className="max-w-7xl mx-auto px-4 py-12">
          <p className="text-gray-500">Đang tải bài học...</p>
        </div>
      </Layout>
    );
  }

  if (!course || !currentLesson || !id) {
    return (
      <Layout>
        <div className="max-w-7xl mx-auto px-4 py-12 text-center">
          <p className="text-gray-500 text-lg">Bài học không tìm thấy</p>
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

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 py-12 grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Cột video + nội dung */}
        <div className="lg:col-span-3">
          {/* Chỉ cho xem video nếu đã enroll */}
          {isCheckingEnroll ? (
            <div className="aspect-video w-full rounded-lg bg-gray-200 animate-pulse flex items-center justify-center text-gray-500">
              Đang kiểm tra quyền truy cập...
            </div>
          ) : isEnrolled ? (
            <VideoPlayer
              videoUrl={currentLesson.videoUrl}
              title={currentLesson.title}
              durationSeconds={currentLesson.durationSeconds}
              lessonId={currentLesson.id}
              onProgress={handleProgressUpdate}
            />
          ) : (
            <div className="aspect-video w-full rounded-lg bg-gray-100 border border-dashed border-gray-300 flex flex-col items-center justify-center text-center px-6">
              <p className="text-lg font-semibold text-gray-800 mb-2">
                Bạn cần đăng ký khóa học để xem video bài học này.
              </p>
              <p className="text-sm text-gray-500 mb-4">
                Hãy quay lại trang khóa học và ấn "Đăng ký khóa học".
              </p>
              <Button
                variant="primary"
                onClick={() => navigate(`/courses/${slug}`)}
              >
                Quay lại trang khóa học
              </Button>
            </div>
          )}

          <h1 className="text-3xl font-bold mt-6">{currentLesson.title}</h1>
          <p className="text-gray-600 mb-6">{currentLesson.content}</p>

          {/* Tiến độ */}
          <LessonProgress progress={progress} />

          {/* Nút chuyển sang trang Quiz riêng */}
          <div className="mt-4">
            <Button
              variant="primary"
              onClick={() =>
                navigate(`/courses/${slug}/lesson/${id}/quiz`)
              }
              className="w-full"
            >
              📝 Làm Quiz
            </Button>
          </div>

          {/* Tài liệu đính kèm */}
          <LessonResources lessonId={currentLesson.id} />

          {/* Điều hướng bài trước / sau – căn 2 bên cho đẹp */}
          <div className="grid grid-cols-2 gap-4 mt-4">
            <div>
              {prevLesson && (
                <Link to={`/courses/${slug}/lesson/${prevLesson.id}`}>
                  <Button variant="secondary" className="w-full">
                    ← Bài trước
                  </Button>
                </Link>
              )}
            </div>
            <div className="text-right">
              {nextLesson && (
                <Link to={`/courses/${slug}/lesson/${nextLesson.id}`}>
                  <Button className="w-full">Bài tiếp →</Button>
                </Link>
              )}
            </div>
          </div>

          {/* Thảo luận */}
          <LessonDiscussion lessonId={currentLesson.id} />
        </div>

        {/* Sidebar danh sách bài học */}
        <div className="lg:col-span-1">
          <LessonSidebar
            courseTitle={course.title}
            lessons={course.lessons}
            currentLessonId={id}
            courseSlug={slug}
          />
        </div>
      </div>
    </Layout>
  );
};
