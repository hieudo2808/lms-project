import { useState, useMemo, useRef, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useQuery, useMutation } from '@apollo/client';
import { toast } from 'react-toastify';
import { Layout, VideoPlayer, Button } from '../../components/common';
import { ArrowLeft, BookOpen, CheckCircle, AlertCircle } from 'lucide-react';
import { GET_COURSE_WITH_LESSONS } from '../../graphql/queries/course';
import { GET_QUIZ_BY_LESSON } from '../../graphql/queries/quiz';
import { UPDATE_PROGRESS_MUTATION } from '../../graphql/mutations/enrollment';
import { QuizCard } from '../../components/student/QuizCard';

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

    /* =====================
        STATE
    ====================== */
    const [isCompleted, setIsCompleted] = useState(false);
    const lastUpdateCall = useRef(0);

    /* =====================
        QUERIES
    ====================== */
    const {
        data: courseData,
        loading: courseLoading,
        error: courseError,
    } = useQuery(GET_COURSE_WITH_LESSONS, {
        variables: { slug: slug || '' },
        skip: !slug,
    });

    const { data: quizData } = useQuery(GET_QUIZ_BY_LESSON, {
        variables: { lessonId: lessonId || '' },
        skip: !lessonId,
    });

    const [updateProgress] = useMutation(UPDATE_PROGRESS_MUTATION);

    /* =====================
        DERIVED DATA (THAY useEffect + useState)
    ====================== */
    const lessons = useMemo<Lesson[]>(() => {
        if (!courseData?.getCourseBySlug?.modules) return [];

        return courseData.getCourseBySlug.modules.flatMap(
            (mod: any) =>
                mod.lessons?.map((l: any) => ({
                    lessonId: l.lessonId,
                    title: l.title,
                    description: l.description || '',
                    videoUrl: l.videoUrl || '',
                    durationSeconds: l.durationSeconds || 0,
                    order: l.order,
                })) ?? [],
        );
    }, [courseData]);

    const currentIndex = useMemo(() => lessons.findIndex((l) => l.lessonId === lessonId), [lessons, lessonId]);

    const currentLesson = currentIndex >= 0 ? lessons[currentIndex] : null;

    const quizzes = useMemo<Quiz[]>(() => {
        if (!quizData?.getQuizzesByLesson) return [];
        return quizData.getQuizzesByLesson.map((q: any) => ({
            quizId: q.quizId,
            title: q.title,
            description: q.description,
            isPublished: q.isPublished,
            passingScore: q.passingScore,
        }));
    }, [quizData]);

    const nextLesson = currentIndex < lessons.length - 1 ? lessons[currentIndex + 1] : null;
    const previousLesson = currentIndex > 0 ? lessons[currentIndex - 1] : null;

    /* =====================
        PROGRESS LOGIC
    ====================== */
    const handleWatchedUpdate = useCallback(
        async (watchedSeconds: number, totalDuration: number) => {
            if (!currentLesson || totalDuration === 0) return;

            const watchedPercent = Math.round((watchedSeconds / totalDuration) * 100);

            // Mark complete when user has watched 80% of total duration
            if (watchedPercent >= 80 && !isCompleted) {
                setIsCompleted(true);
                try {
                    await updateProgress({
                        variables: {
                            lessonId: currentLesson.lessonId,
                            input: {
                                watchedSeconds: Math.round(watchedSeconds),
                                progressPercent: 100,
                            },
                        },
                    });
                    toast.success('✓ Đã hoàn thành bài học!');
                } catch (err: unknown) {
                    console.error('Progress update error:', err);
                }
                return;
            }

            // Background update every 30 seconds
            const now = Date.now();
            if (!isCompleted && now - lastUpdateCall.current > 30000) {
                lastUpdateCall.current = now;
                updateProgress({
                    variables: {
                        lessonId: currentLesson.lessonId,
                        input: {
                            watchedSeconds: Math.round(watchedSeconds),
                            progressPercent: watchedPercent,
                        },
                    },
                }).catch(() => {});
            }
        },
        [currentLesson, isCompleted, updateProgress],
    );

    const handleNextLesson = useCallback(() => {
        if (nextLesson) {
            navigate(`/courses/${slug}/lesson/${nextLesson.lessonId}`);
        }
    }, [nextLesson, slug, navigate]);

    const handlePreviousLesson = useCallback(() => {
        if (previousLesson) {
            navigate(`/courses/${slug}/lesson/${previousLesson.lessonId}`);
        }
    }, [previousLesson, slug, navigate]);

    /* =====================
        LOADING / ERROR (GIỮ NGUYÊN UI)
    ====================== */
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
                    <h2 className="text-2xl font-bold text-gray-800 mb-2">Bài học không tìm thấy</h2>
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

    /* =====================
        JSX — GIỮ NGUYÊN 100%
    ====================== */
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
                                onWatchedUpdate={handleWatchedUpdate}
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
                                    <h1 className="text-3xl font-bold text-gray-800 mb-2">{currentLesson.title}</h1>
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

                            {/* Description */}
                            {currentLesson.description && (
                                <div className="mb-8 p-4 bg-gray-50 rounded-lg">
                                    <h3 className="font-bold text-gray-800 mb-2">Mô tả</h3>
                                    <p className="text-gray-700 whitespace-pre-wrap">{currentLesson.description}</p>
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
                                        <QuizCard
                                            key={quiz.quizId}
                                            quizId={quiz.quizId}
                                            title={quiz.title}
                                            description={quiz.description}
                                            passingScore={quiz.passingScore}
                                            isPublished={quiz.isPublished}
                                        />
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
                            <h3 className="font-bold text-lg text-gray-800 mb-4">Bài học ({lessons.length})</h3>

                            <div className="space-y-2 max-h-[600px] overflow-y-auto">
                                {lessons.map((lesson, idx) => (
                                    <Link key={lesson.lessonId} to={`/courses/${slug}/lesson/${lesson.lessonId}`}>
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
