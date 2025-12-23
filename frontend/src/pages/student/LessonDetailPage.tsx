import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useQuery, useMutation } from '@apollo/client';
import { toast } from 'react-toastify';
import {
  Layout,
  VideoPlayer,
  Button,
} from '../../components/common';
import {
  ArrowLeft,
  ChevronRight,
  BookOpen,
  CheckCircle,
  AlertCircle,
} from 'lucide-react';
import { GET_COURSE_WITH_LESSONS } from '../../graphql/queries/course';
import { GET_QUIZ_BY_LESSON } from '../../graphql/queries/quiz';
import { UPDATE_PROGRESS_MUTATION } from '../../graphql/mutations/enrollment';

interface Lesson {
  lessonId: string;
  title: string;
  description: string;
  videoUrl: string;
  durationSeconds: number;
  order: number;
}

interface Quiz {
  quizId: string;
  title: string;
  description: string;
  isPublished: boolean;
  passingScore: number;
}

export const LessonDetailPage = () => {
  const { slug, lessonId } = useParams<{ slug: string; lessonId: string }>();
  const navigate = useNavigate();

  // State
  const [currentLesson, setCurrentLesson] = useState<Lesson | null>(null);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [progress, setProgress] = useState(0);
  const [isCompleted, setIsCompleted] = useState(false);
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);

  // Queries
  const { data: courseData, loading: courseLoading, error: courseError } = useQuery(
    GET_COURSE_WITH_LESSONS,
    {
      variables: { slug: slug || '' },
      skip: !slug,
    }
  );

  const { data: quizData } = useQuery(GET_QUIZ_BY_LESSON, {
    variables: { lessonId: lessonId || '' },
    skip: !lessonId,
  });

  const [updateProgress] = useMutation(UPDATE_PROGRESS_MUTATION);

  // Initialize lesson data
  useEffect(() => {
    if (courseData?.getCourseByCourseSlug?.modules) {
      const allLessons: Lesson[] = [];
      courseData.getCourseByCourseSlug.modules.forEach((mod: Record<string, unknown>) => {
        if (mod.lessons) {
          allLessons.push(
            ...mod.lessons.map((l: Record<string, unknown>) => ({
              lessonId: l.lessonId,
              title: l.title,
              description: l.description || '',
              videoUrl: l.videoUrl || '',
              durationSeconds: l.durationSeconds || 0,
              order: l.order,
            }))
          );
        }
      });

      setLessons(allLessons);

      if (lessonId) {
        const current = allLessons.find((l) => l.lessonId === lessonId);
        if (current) {
          setCurrentLesson(current);
          setCurrentIndex(allLessons.indexOf(current));
        }
      }
    }
  }, [courseData, lessonId]);

  // Set quizzes
  useEffect(() => {
    if (quizData?.getQuizzesByLesson) {
      setQuizzes(
        quizData.getQuizzesByLesson.map((q: Record<string, unknown>) => ({
          quizId: q.quizId,
          title: q.title,
          description: q.description,
          isPublished: q.isPublished,
          passingScore: q.passingScore,
        }))
      );
    }
  }, [quizData]);

  // Handle progress update
  const handleProgressUpdate = async (
    currentTime: number,
    duration: number
  ) => {
    if (!currentLesson) return;

    const newProgress = Math.round((currentTime / duration) * 100);
    setProgress(newProgress);

    // Mark as completed when 90%+ watched
    if (newProgress >= 90 && !isCompleted) {
      setIsCompleted(true);
      try {
        await updateProgress({
          variables: {
            lessonId: currentLesson.lessonId,
            input: {
              watchedSeconds: Math.round(currentTime),
              progressPercent: 100,
            },
          },
        });
        toast.success('✓ Đã hoàn thành bài học!');
      } catch (err: unknown) {
        console.error('Progress update error:', err);
      }
    }
  };

  const handleNextLesson = () => {
    if (currentIndex < lessons.length - 1) {
      const nextLesson = lessons[currentIndex + 1];
      navigate(`/courses/${slug}/lesson/${nextLesson.lessonId}`);
    }
  };

  const handlePreviousLesson = () => {
    if (currentIndex > 0) {
      const prevLesson = lessons[currentIndex - 1];
      navigate(`/courses/${slug}/lesson/${prevLesson.lessonId}`);
    }
  };

  if (courseLoading) {
    return (
      <Layout>
        <div className="max-w-6xl mx-auto px-4 py-12">
          <div className="animate-pulse">
            <div className="aspect-video bg-gray-300 rounded-lg mb-8"></div>
            <div className="h-8 bg-gray-300 rounded w-1/2 mb-4"></div>
            <div className="h-4 bg-gray-300 rounded"></div>
          </div>
        </div>
      </Layout>
    );
  }

  if (courseError || !currentLesson) {
    return (
      <Layout>
        <div className="max-w-6xl mx-auto px-4 py-12 text-center">
          <AlertCircle className="w-16 h-16 text-red-600 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-800 mb-2">
            Bài học không tìm thấy
          </h2>
          <button
            onClick={() => navigate('/')}
            className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Quay lại trang chủ
          </button>
        </div>
      </Layout>
    );
  }

  const nextLesson =
    currentIndex < lessons.length - 1 ? lessons[currentIndex + 1] : null;
  const previousLesson = currentIndex > 0 ? lessons[currentIndex - 1] : null;

  return (
    <Layout>
      <div className="max-w-6xl mx-auto px-4 py-8 pb-20">
        {/* Back Button */}
        <button
          onClick={() => navigate(`/courses/${slug}`)}
          className="flex items-center gap-2 text-gray-600 hover:text-blue-600 mb-6 font-medium"
        >
          <ArrowLeft size={18} /> Quay lại khóa học
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {/* Video Player */}
            {currentLesson.videoUrl ? (
              <VideoPlayer
                videoUrl={currentLesson.videoUrl}
                title={currentLesson.title}
                duration={Math.round(currentLesson.durationSeconds / 60)}
                onProgress={handleProgressUpdate}
              />
            ) : (
              <div className="aspect-video bg-gray-300 rounded-lg flex items-center justify-center mb-8">
                <div className="text-center">
                  <AlertCircle className="w-12 h-12 text-gray-500 mx-auto mb-2" />
                  <p className="text-gray-600">Video chưa được tải lên</p>
                </div>
              </div>
            )}

            {/* Lesson Info */}
            <div className="mt-8">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h1 className="text-3xl font-bold text-gray-800 mb-2">
                    {currentLesson.title}
                  </h1>
                  <p className="text-gray-600">
                    {Math.round(currentLesson.durationSeconds / 60)} phút
                  </p>
                </div>

                {isCompleted && (
                  <div className="flex items-center gap-2 px-4 py-2 bg-green-100 text-green-800 rounded-lg font-medium">
                    <CheckCircle size={20} /> Hoàn thành
                  </div>
                )}
              </div>

              {/* Progress Bar */}
              {!isCompleted && (
                <div className="mb-6">
                  <div className="flex justify-between text-sm text-gray-600 mb-2">
                    <span>Tiến độ</span>
                    <span>{progress}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full transition-all"
                      style={{ width: `${progress}%` }}
                    ></div>
                  </div>
                </div>
              )}

              {/* Description */}
              {currentLesson.description && (
                <div className="mb-8 p-4 bg-gray-50 rounded-lg">
                  <h3 className="font-bold text-gray-800 mb-2">Mô tả</h3>
                  <p className="text-gray-700 whitespace-pre-wrap">
                    {currentLesson.description}
                  </p>
                </div>
              )}
            </div>

            {/* Quizzes Section */}
            {quizzes.length > 0 && (
              <div className="mt-8 bg-white border-2 border-purple-200 rounded-lg p-6">
                <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                  <BookOpen size={20} className="text-purple-600" /> Bài quiz
                </h2>
                <div className="space-y-3">
                  {quizzes.map((quiz) => (
                    <div
                      key={quiz.quizId}
                      className="p-4 border border-gray-200 rounded-lg hover:border-purple-400 transition-all flex items-center justify-between"
                    >
                      <div className="flex-1">
                        <h3 className="font-bold text-gray-800">{quiz.title}</h3>
                        {quiz.description && (
                          <p className="text-sm text-gray-600 mt-1">
                            {quiz.description}
                          </p>
                        )}
                        <p className="text-xs text-gray-500 mt-2">
                          Điểm cần đạt: {quiz.passingScore}%
                        </p>
                      </div>
                      {quiz.isPublished ? (
                        <button
                          onClick={() =>
                            navigate(`/student/quizzes/${quiz.quizId}`)
                          }
                          className="ml-4 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 font-medium flex items-center gap-2"
                        >
                          Làm bài <ChevronRight size={18} />
                        </button>
                      ) : (
                        <div className="ml-4 px-4 py-2 bg-gray-100 text-gray-500 rounded-lg font-medium">
                          Chưa công bố
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Navigation */}
            <div className="mt-8 flex gap-4">
              {previousLesson ? (
                <button
                  onClick={handlePreviousLesson}
                  className="flex-1 px-6 py-3 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 font-medium flex items-center justify-center gap-2"
                >
                  ← {previousLesson.title}
                </button>
              ) : (
                <div className="flex-1"></div>
              )}

              {nextLesson && (
                <button
                  onClick={handleNextLesson}
                  className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium flex items-center justify-center gap-2"
                >
                  {nextLesson.title} →
                </button>
              )}
            </div>
          </div>

          {/* Sidebar - Lessons List */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow p-4 sticky top-4">
              <h3 className="font-bold text-lg text-gray-800 mb-4">
                Bài học ({lessons.length})
              </h3>

              <div className="space-y-2 max-h-[600px] overflow-y-auto">
                {lessons.map((lesson, idx) => (
                  <Link
                    key={lesson.lessonId}
                    to={`/courses/${slug}/lesson/${lesson.lessonId}`}
                  >
                    <div
                      className={`p-3 rounded-lg cursor-pointer transition-all ${
                        lesson.lessonId === currentLesson.lessonId
                          ? 'bg-blue-100 border-2 border-blue-500'
                          : 'border border-gray-200 hover:border-blue-400 hover:bg-blue-50'
                      }`}
                    >
                      <div className="flex items-start gap-2">
                        <span
                          className={`text-xs font-bold mt-1 ${
                            lesson.lessonId === currentLesson.lessonId
                              ? 'text-blue-600'
                              : 'text-gray-400'
                          }`}
                        >
                          {idx + 1}
                        </span>
                        <div className="flex-1 min-w-0">
                          <p
                            className={`font-medium text-sm line-clamp-2 ${
                              lesson.lessonId === currentLesson.lessonId
                                ? 'text-blue-700'
                                : 'text-gray-800'
                            }`}
                          >
                            {lesson.title}
                          </p>
                          <p className="text-xs text-gray-500 mt-1">
                            ⏱ {Math.round(lesson.durationSeconds / 60)} phút
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
