import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation } from '@apollo/client';
import { Layout } from '../../components/common/Layout';
import { GET_COURSE_BY_SLUG } from '../../graphql/queries/course';
import { GET_MY_PROGRESS } from '../../graphql/queries/progress';
import { GET_CERTIFICATE_BY_COURSE } from '../../graphql/queries/certificate';
import { GENERATE_CERTIFICATE } from '../../graphql/mutations/certificate';
import { toast } from 'react-toastify';
import { BookOpen, CheckCircle, Clock, ArrowLeft, PlayCircle, TrendingUp, Award, Download } from 'lucide-react';

interface Progress {
    progressId: string;
    lessonId: string;
    lessonTitle: string;
    watchedSeconds: number;
    progressPercent: number;
    lastWatchedAt: string;
}

export const CourseProgressPage = () => {
    const { slug } = useParams<{ slug: string }>();
    const navigate = useNavigate();

    const { data: courseData, loading: courseLoading } = useQuery(GET_COURSE_BY_SLUG, {
        variables: { slug },
        skip: !slug,
    });

    const course = courseData?.getCourseBySlug;
    const courseId = course?.courseId;

    const { data: progressData, loading: progressLoading } = useQuery(GET_MY_PROGRESS, {
        variables: { courseId },
        skip: !courseId,
        fetchPolicy: 'cache-and-network',
    });

    const { data: certificateData, refetch: refetchCertificate } = useQuery(GET_CERTIFICATE_BY_COURSE, {
        variables: { courseId },
        skip: !courseId,
    });

    const existingCertificate = certificateData?.getCertificateByCourse;

    const [generateCertificate, { loading: isGenerating }] = useMutation(GENERATE_CERTIFICATE, {
        onCompleted: () => {
            toast.success('Chứng chỉ đã được tạo thành công!');
            refetchCertificate();
        },
        onError: (err) => {
            toast.error('Lỗi: ' + err.message);
        },
    });

    const handleGenerateCertificate = () => {
        if (window.confirm('Bạn có muốn tạo chứng chỉ cho khóa học này?')) {
            generateCertificate({ variables: { courseId } });
        }
    };

    const progressList: Progress[] = progressData?.myProgress || [];

    // Calculate statistics
    const totalLessons =
        course?.modules?.reduce((sum: number, module: any) => sum + (module.lessons?.length || 0), 0) || 0;

    const completedLessons = progressList.filter((p) => p.progressPercent >= 90).length;
    const inProgressLessons = progressList.filter((p) => p.progressPercent > 0 && p.progressPercent < 90).length;

    const overallProgress = totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0;

    const totalWatchedSeconds = progressList.reduce((sum, p) => sum + p.watchedSeconds, 0);

    const formatTime = (seconds: number) => {
        const hours = Math.floor(seconds / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        if (hours > 0) return `${hours}h ${minutes}m`;
        return `${minutes}m`;
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('vi-VN', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    const getProgressColor = (percent: number) => {
        if (percent >= 90) return 'bg-green-500';
        if (percent >= 50) return 'bg-yellow-500';
        if (percent > 0) return 'bg-blue-500';
        return 'bg-gray-300';
    };

    const getProgressStatus = (percent: number) => {
        if (percent >= 90) return { text: 'Hoàn thành', color: 'text-green-600', icon: CheckCircle };
        if (percent > 0) return { text: 'Đang học', color: 'text-blue-600', icon: PlayCircle };
        return { text: 'Chưa học', color: 'text-gray-500', icon: BookOpen };
    };

    if (courseLoading || progressLoading) {
        return (
            <Layout>
                <div className="max-w-6xl mx-auto px-4 py-12">
                    <div className="animate-pulse space-y-4">
                        <div className="h-8 bg-gray-300 rounded w-1/3"></div>
                        <div className="h-64 bg-gray-300 rounded"></div>
                    </div>
                </div>
            </Layout>
        );
    }

    if (!course) {
        return (
            <Layout>
                <div className="max-w-6xl mx-auto px-4 py-12 text-center">
                    <h2 className="text-2xl font-bold text-gray-800">Không tìm thấy khóa học</h2>
                </div>
            </Layout>
        );
    }

    return (
        <Layout>
            <div className="max-w-6xl mx-auto px-4 py-8">
                {/* Header */}
                <button
                    onClick={() => navigate(`/courses/${slug}`)}
                    className="flex items-center gap-2 text-gray-600 hover:text-blue-600 mb-6 font-medium"
                >
                    <ArrowLeft size={18} /> Quay lại khóa học
                </button>

                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 mb-2 flex items-center gap-3">
                        <TrendingUp className="text-blue-600" size={36} />
                        Tiến độ học tập
                    </h1>
                    <p className="text-gray-600 text-lg">{course.title}</p>
                </div>

                {/* Statistics Cards */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                    <div className="bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-xl p-6 shadow-lg">
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-blue-100 text-sm font-medium">Tiến độ</span>
                            <TrendingUp size={24} className="opacity-80" />
                        </div>
                        <p className="text-4xl font-bold">{overallProgress}%</p>
                    </div>

                    <div className="bg-gradient-to-br from-green-500 to-emerald-600 text-white rounded-xl p-6 shadow-lg">
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-green-100 text-sm font-medium">Hoàn thành</span>
                            <CheckCircle size={24} className="opacity-80" />
                        </div>
                        <p className="text-4xl font-bold">
                            {completedLessons}/{totalLessons}
                        </p>
                    </div>

                    <div className="bg-gradient-to-br from-amber-500 to-orange-600 text-white rounded-xl p-6 shadow-lg">
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-amber-100 text-sm font-medium">Đang học</span>
                            <PlayCircle size={24} className="opacity-80" />
                        </div>
                        <p className="text-4xl font-bold">{inProgressLessons}</p>
                    </div>

                    <div className="bg-gradient-to-br from-purple-500 to-indigo-600 text-white rounded-xl p-6 shadow-lg">
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-purple-100 text-sm font-medium">Thời gian</span>
                            <Clock size={24} className="opacity-80" />
                        </div>
                        <p className="text-4xl font-bold">{formatTime(totalWatchedSeconds)}</p>
                    </div>
                </div>

                {/* Overall Progress Bar */}
                <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 mb-8">
                    <h2 className="text-lg font-bold text-gray-900 mb-4">Tổng quan</h2>
                    <div className="relative">
                        <div className="w-full bg-gray-200 rounded-full h-8">
                            <div
                                className="bg-gradient-to-r from-blue-500 to-purple-600 h-8 rounded-full flex items-center justify-center text-white text-sm font-bold transition-all"
                                style={{ width: `${overallProgress}%` }}
                            >
                                {overallProgress}%
                            </div>
                        </div>
                    </div>
                </div>

                {/* Certificate Section - Show when completed >= 90% */}
                {overallProgress >= 90 && (
                    <div className="bg-gradient-to-r from-amber-50 to-orange-50 rounded-xl p-6 shadow-sm border-2 border-amber-200 mb-8">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <div className="p-3 bg-amber-500 rounded-full">
                                    <Award className="text-white" size={32} />
                                </div>
                                <div>
                                    <h2 className="text-xl font-bold text-gray-900">🎉 Chúc mừng bạn!</h2>
                                    <p className="text-gray-600">
                                        {existingCertificate
                                            ? 'Bạn đã nhận được chứng chỉ hoàn thành khóa học.'
                                            : 'Bạn đủ điều kiện nhận chứng chỉ hoàn thành khóa học.'}
                                    </p>
                                </div>
                            </div>
                            <div>
                                {existingCertificate ? (
                                    <button
                                        onClick={() =>
                                            existingCertificate.pdfUrl &&
                                            window.open(existingCertificate.pdfUrl, '_blank')
                                        }
                                        className="flex items-center gap-2 bg-green-600 text-white px-6 py-3 rounded-lg font-bold hover:bg-green-700 transition-colors"
                                    >
                                        <Download size={20} />
                                        Tải chứng chỉ
                                    </button>
                                ) : (
                                    <button
                                        onClick={handleGenerateCertificate}
                                        disabled={isGenerating}
                                        className="flex items-center gap-2 bg-amber-600 text-white px-6 py-3 rounded-lg font-bold hover:bg-amber-700 transition-colors disabled:opacity-50"
                                    >
                                        <Award size={20} />
                                        {isGenerating ? 'Đang tạo...' : 'Nhận chứng chỉ'}
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                )}

                {/* Modules & Lessons Progress */}
                <div className="space-y-6">
                    {course.modules?.map((module: any, moduleIndex: number) => {
                        const moduleLessons = module.lessons || [];
                        const moduleProgress = moduleLessons.map((lesson: any) => {
                            const progress = progressList.find((p) => p.lessonId === lesson.lessonId);
                            return progress || null;
                        });

                        const moduleCompleted = moduleProgress.filter((p) => p && p.progressPercent >= 90).length;

                        return (
                            <div
                                key={module.moduleId}
                                className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden"
                            >
                                {/* Module Header */}
                                <div className="bg-gradient-to-r from-gray-50 to-blue-50 p-6 border-b border-gray-200">
                                    <div className="flex items-center justify-between">
                                        <h3 className="text-xl font-bold text-gray-900">
                                            {moduleIndex + 1}. {module.title}
                                        </h3>
                                        <span className="text-sm font-semibold text-blue-600 bg-blue-100 px-3 py-1 rounded-full">
                                            {moduleCompleted}/{moduleLessons.length} hoàn thành
                                        </span>
                                    </div>
                                </div>

                                {/* Lessons List */}
                                <div className="divide-y divide-gray-100">
                                    {moduleLessons.map((lesson: any) => {
                                        const lessonProgress = progressList.find((p) => p.lessonId === lesson.lessonId);
                                        const percent = lessonProgress?.progressPercent || 0;
                                        const status = getProgressStatus(percent);
                                        const StatusIcon = status.icon;

                                        return (
                                            <div
                                                key={lesson.lessonId}
                                                className="p-6 hover:bg-gray-50 transition-colors cursor-pointer"
                                                onClick={() => navigate(`/courses/${slug}/lesson/${lesson.lessonId}`)}
                                            >
                                                <div className="flex items-start gap-4">
                                                    <StatusIcon
                                                        className={`${status.color} flex-shrink-0 mt-1`}
                                                        size={20}
                                                    />

                                                    <div className="flex-1 min-w-0">
                                                        <h4 className="font-semibold text-gray-900 mb-1">
                                                            {lesson.title}
                                                        </h4>

                                                        {lessonProgress && (
                                                            <p className="text-xs text-gray-500 mb-2">
                                                                Học gần nhất: {formatDate(lessonProgress.lastWatchedAt)}
                                                            </p>
                                                        )}

                                                        {/* Progress Bar */}
                                                        <div className="flex items-center gap-3">
                                                            <div className="flex-1 bg-gray-200 rounded-full h-2">
                                                                <div
                                                                    className={`${getProgressColor(
                                                                        percent,
                                                                    )} h-2 rounded-full transition-all`}
                                                                    style={{ width: `${percent}%` }}
                                                                ></div>
                                                            </div>
                                                            <span
                                                                className={`text-sm font-semibold ${status.color} min-w-[80px]`}
                                                            >
                                                                {percent}%
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </Layout>
    );
};
