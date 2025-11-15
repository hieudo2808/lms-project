import { useState, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Layout } from '../components/Layout';
import { VideoPlayer } from '../components/VideoPlayer';
import { Button } from '../components/Button';
import { lessonAPI } from '../services/api';
import type { CourseDetail, Lesson, Progress } from '../types';

export const LessonPage = () => {
  const { slug, id } = useParams<{ slug: string; id: string }>();
  const [course, setCourse] = useState<CourseDetail | null>(null);
  const [currentLesson, setCurrentLesson] = useState<Lesson | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [progress, setProgress] = useState<Progress | null>(null);
  const lastProgressSavedRef = useRef(0);

  // Mock data
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
    fullDescription: '',
    lessons: [
      {
        id: '1',
        title: 'Giới thiệu về React',
        duration: 15,
        videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-library/sample/BigBuckBunny.mp4',
        description: 'Tìm hiểu cơ bản về React',
        order: 1,
      },
      {
        id: '2',
        title: 'JSX và Components',
        duration: 20,
        videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-library/sample/ElephantsDream.mp4',
        description: 'Học về JSX syntax và cách tạo components',
        order: 2,
      },
      {
        id: '3',
        title: 'React Hooks - useState',
        duration: 25,
        videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-library/sample/ForBiggerBlazes.mp4',
        description: 'Quản lý state với useState hook',
        order: 3,
      },
      {
        id: '4',
        title: 'React Hooks - useEffect',
        duration: 20,
        videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-library/sample/ForBiggerEscapes.mp4',
        description: 'Side effects với useEffect hook',
        order: 4,
      },
      {
        id: '5',
        title: 'TypeScript Basics',
        duration: 30,
        videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-library/sample/ForBiggerFun.mp4',
        description: 'Giới thiệu TypeScript',
        order: 5,
      },
    ],
  };

  useEffect(() => {
    // Simulate API call: GET /courses/{slug} and /progress
    const timer = setTimeout(() => {
      if (slug === 'react-typescript-zero-hero') {
        setCourse(mockCourse);
        const lesson = mockCourse.lessons.find((l) => l.id === id);
        if (lesson) {
          setCurrentLesson(lesson);
        }
      }
      setIsLoading(false);
    }, 500);

    return () => clearTimeout(timer);
  }, [slug, id]);

  const handleProgressUpdate = (newProgress: Progress) => {
    setProgress(newProgress);
    
    // Save progress every 30 seconds
    const now = Date.now();
    if (now - lastProgressSavedRef.current >= 30000) {
      lastProgressSavedRef.current = now;
      
      if (id && currentLesson) {
        lessonAPI.saveProgress(id, newProgress.watchedDuration, newProgress.totalDuration)
          .catch(() => console.error('Failed to save progress'));
      }
    }
  };

  const getCurrentLessonIndex = () => {
    return course?.lessons.findIndex((l) => l.id === id) ?? -1;
  };

  const getCurrentIndex = getCurrentLessonIndex();
  const previousLesson = getCurrentIndex > 0 ? course?.lessons[getCurrentIndex - 1] : null;
  const nextLesson = getCurrentIndex >= 0 && getCurrentIndex < (course?.lessons.length ?? 0) - 1
    ? course?.lessons[getCurrentIndex + 1]
    : null;

  if (isLoading) {
    return (
      <Layout>
        <div className="max-w-7xl mx-auto px-4 py-12">
          <div className="animate-pulse">
            <div className="aspect-video bg-gray-300 rounded-lg mb-8"></div>
            <div className="h-8 bg-gray-300 rounded w-1/2 mb-4"></div>
            <div className="h-4 bg-gray-300 rounded"></div>
          </div>
        </div>
      </Layout>
    );
  }

  if (!course || !currentLesson) {
    return (
      <Layout>
        <div className="max-w-7xl mx-auto px-4 py-12 text-center">
          <p className="text-gray-500 text-lg">Bài học không tìm thấy</p>
          <Link to="/" className="text-blue-600 hover:underline mt-4 inline-block">
            Quay lại trang chủ
          </Link>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Video Player */}
          <div className="lg:col-span-3">
            <VideoPlayer
              videoUrl={currentLesson.videoUrl}
              title={currentLesson.title}
              duration={currentLesson.duration}
              onProgress={handleProgressUpdate}
            />

            <div className="mt-8">
              <h1 className="text-3xl font-bold text-gray-800 mb-4">
                {currentLesson.title}
              </h1>
              <p className="text-gray-600 mb-6">
                {currentLesson.description}
              </p>

              {progress && (
                <div className="mb-6 p-4 bg-blue-50 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-semibold text-gray-800">Tiến độ</span>
                    <span className="text-sm text-gray-600">
                      {Math.round((progress.watchedDuration / progress.totalDuration) * 100)}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-300 rounded-full h-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full transition-all"
                      style={{
                        width: `${(progress.watchedDuration / progress.totalDuration) * 100}%`,
                      }}
                    ></div>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                {previousLesson && (
                  <Link to={`/courses/${slug}/lesson/${previousLesson.id}`}>
                    <Button variant="secondary" className="w-full">
                      ← Bài trước
                    </Button>
                  </Link>
                )}
                {nextLesson && (
                  <Link to={`/courses/${slug}/lesson/${nextLesson.id}`}>
                    <Button variant="primary" className="w-full">
                      Bài tiếp theo →
                    </Button>
                  </Link>
                )}
              </div>
            </div>
          </div>

          {/* Sidebar - Lessons List */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-md p-4 sticky top-4">
              <h3 className="font-bold text-lg text-gray-800 mb-4">
                {course.title}
              </h3>

              <div className="space-y-2 max-h-96 overflow-y-auto">
                {course.lessons.map((lesson, index) => (
                  <Link key={lesson.id} to={`/courses/${slug}/lesson/${lesson.id}`}>
                    <div
                      className={`p-3 rounded-lg cursor-pointer transition-colors ${
                        lesson.id === id
                          ? 'bg-blue-100 border border-blue-500'
                          : 'hover:bg-gray-100'
                      }`}
                    >
                      <div className="flex items-start gap-2">
                        <span className="text-xs font-bold text-gray-400 mt-1">
                          {index + 1}
                        </span>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm text-gray-800 line-clamp-2">
                            {lesson.title}
                          </p>
                          <p className="text-xs text-gray-500">
                            ⏱ {lesson.duration} phút
                          </p>
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>

              <Link to={`/courses/${slug}`}>
                <Button variant="secondary" className="w-full mt-4">
                  Quay lại khóa học
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};
