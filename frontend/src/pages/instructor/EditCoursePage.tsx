import { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useLazyQuery, useMutation } from '@apollo/client';
import { toast } from 'react-toastify';
import {
    ArrowLeft,
    Eye,
    Globe,
    Lock,
    CheckCircle,
    AlertCircle,
    FileText,
    ClipboardList,
    PlusCircle,
    Edit3,
} from 'lucide-react';

import { GET_COURSE_BY_SLUG } from '../../graphql/queries/course';
import { GET_QUIZ_BY_LESSON } from '../../graphql/queries/quiz';
import { PUBLISH_COURSE_MUTATION, UNPUBLISH_COURSE_MUTATION } from '../../graphql/mutations/instructor';

import CurriculumEditor from '../../components/instructor/CurriculumEditor';
import CourseInfoForm from '../../components/instructor/CourseInfoForm';
import { CoInstructorManager } from '../../components/instructor/CoInstructorManager';
import { useAuthStore } from '../../lib/store';

export const EditCoursePage = () => {
    const { slug } = useParams();
    const navigate = useNavigate();

    // 1. QUERY: Lấy thông tin khóa học
    const {
        data: courseData,
        loading: courseLoading,
        error: courseError,
        refetch: refetchCourse,
    } = useQuery(GET_COURSE_BY_SLUG, {
        variables: { slug },
        fetchPolicy: 'network-only',
        notifyOnNetworkStatusChange: true,
    });

    // 2. MUTATION: Xuất bản & Gỡ bỏ
    const [publishCourse, { loading: publishing }] = useMutation(PUBLISH_COURSE_MUTATION);
    const [unpublishCourse, { loading: unpublishing }] = useMutation(UNPUBLISH_COURSE_MUTATION);

    // --- TÍNH TOÁN ID ĐỂ FETCH QUIZ (AN TOÀN) ---
    const course = courseData?.getCourseBySlug;

    // Dùng useMemo hoặc optional chaining an toàn để lấy ID
    const firstLessonId = course?.modules?.find((m: any) => m.lessons?.length > 0)?.lessons[0]?.lessonId;

    // 3. QUERY PHỤ: Lấy danh sách Quiz
    // QUAN TRỌNG: Hook này PHẢI nằm trước mọi lệnh return
    const [getQuizzes, { data: quizData }] = useLazyQuery(GET_QUIZ_BY_LESSON, {
        fetchPolicy: 'network-only',
    });

    // Gọi query khi firstLessonId có giá trị
    useEffect(() => {
        if (firstLessonId) {
            getQuizzes({ variables: { lessonId: firstLessonId } });
        }
    }, [firstLessonId, getQuizzes]);

    const quizzes = quizData?.getQuizzesByLesson || [];
    const isBusy = publishing || unpublishing;

    // --- BÂY GIỜ MỚI ĐƯỢC PHÉP RETURN GIAO DIỆN LOADING/ERROR ---

    if (courseLoading)
        return (
            <div className="flex justify-center items-center h-[80vh]">
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
            </div>
        );

    if (courseError || !course)
        return (
            <div className="flex flex-col items-center justify-center h-[60vh] text-center">
                <AlertCircle className="w-16 h-16 text-red-500 mb-4" />
                <h2 className="text-2xl font-bold text-gray-800">Không tìm thấy khóa học!</h2>
                <button
                    onClick={() => navigate('/instructor/dashboard')}
                    className="px-6 py-2 bg-blue-600 text-white rounded-lg mt-4"
                >
                    Quay lại Dashboard
                </button>
            </div>
        );

    // --- LOGIC XỬ LÝ SỰ KIỆN ---
    const handleTogglePublish = async () => {
        try {
            if (course.isPublished) {
                if (window.confirm('⚠️ CẢNH BÁO: Bạn có chắc muốn gỡ khóa học này?')) {
                    await unpublishCourse({ variables: { courseId: course.courseId } });
                    toast.info('Đã chuyển về trạng thái NHÁP.');
                    refetchCourse();
                }
            } else {
                if (!course.modules || course.modules.length === 0) {
                    toast.warning('Khóa học cần ít nhất một chương nội dung để xuất bản.');
                    return;
                }
                await publishCourse({ variables: { courseId: course.courseId } });
                toast.success('🎉 Khóa học đã được XUẤT BẢN công khai.');
                refetchCourse();
            }
        } catch (err: any) {
            toast.error(err.message);
        }
    };

    return (
        <div className="w-full max-w-6xl mx-auto pb-20 px-4 sm:px-6 lg:px-8">
            {/* --- HEADER BAR --- */}
            <div className="bg-white border-b border-gray-200 sticky top-0 z-10 px-4 sm:px-6 py-3 sm:py-4 -mx-4 sm:-mx-6 lg:-mx-8 mb-6 sm:mb-8 shadow-sm">
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
                    <div className="flex items-center gap-3 sm:gap-4">
                        <button
                            onClick={() => navigate('/instructor/dashboard')}
                            className="p-1.5 sm:p-2 hover:bg-gray-100 rounded-full text-gray-500 flex-shrink-0"
                        >
                            <ArrowLeft className="w-5 h-5 sm:w-6 sm:h-6" />
                        </button>
                        <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
                                <h1 className="text-base sm:text-lg md:text-xl font-bold text-gray-800 truncate max-w-[180px] sm:max-w-xs md:max-w-md">
                                    {course.title}
                                </h1>
                                <div
                                    className={`flex items-center gap-1 sm:gap-1.5 px-2 sm:px-2.5 py-0.5 rounded-full text-[10px] sm:text-xs font-bold border whitespace-nowrap ${
                                        course.isPublished
                                            ? 'bg-green-50 text-green-700 border-green-200'
                                            : 'bg-gray-100 text-gray-600 border-gray-200'
                                    }`}
                                >
                                    {course.isPublished ? (
                                        <CheckCircle className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                                    ) : (
                                        <FileText className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                                    )}
                                    <span className="hidden xs:inline">
                                        {course.isPublished ? 'CÔNG KHAI' : 'NHÁP'}
                                    </span>
                                </div>
                            </div>
                            <p className="text-[10px] sm:text-xs text-gray-500 mt-0.5 hidden sm:block">
                                Biên tập nội dung & bài học
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-2 sm:gap-3">
                        <button
                            onClick={() => window.open(`/courses/${course.slug}?preview=true`, '_blank')}
                            className="flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm font-medium text-gray-700 hover:bg-blue-50 rounded-lg transition-colors"
                        >
                            <Eye className="w-4 h-4 sm:w-5 sm:h-5" />{' '}
                            <span className="hidden sm:inline">Xem trước</span>
                        </button>
                        <button
                            onClick={handleTogglePublish}
                            disabled={isBusy}
                            className={`flex items-center gap-1.5 sm:gap-2 px-3 sm:px-5 py-1.5 sm:py-2 rounded-lg text-xs sm:text-sm font-bold shadow-sm transition-all ${
                                course.isPublished
                                    ? 'bg-white border border-red-200 text-red-600'
                                    : 'bg-blue-600 text-white hover:bg-blue-700'
                            }`}
                        >
                            {isBusy ? (
                                <div className="animate-spin rounded-full h-3.5 w-3.5 sm:h-4 sm:w-4 border-2 border-current border-t-transparent" />
                            ) : course.isPublished ? (
                                <Lock className="w-4 h-4 sm:w-5 sm:h-5" />
                            ) : (
                                <Globe className="w-4 h-4 sm:w-5 sm:h-5" />
                            )}
                            <span>{course.isPublished ? 'Gỡ' : 'Xuất bản'}</span>
                        </button>
                    </div>
                </div>
            </div>

            {/* --- MAIN CONTENT AREA --- */}
            <div className="w-full overflow-x-hidden">
                {!course.isPublished && (
                    <div className="mb-6 bg-blue-50 border border-blue-100 p-4 rounded-xl flex items-start gap-3">
                        <AlertCircle className="text-blue-600 w-5 h-5 mt-0.5 flex-shrink-0" />
                        <div>
                            <h4 className="font-semibold text-blue-800 text-sm">Khóa học này chưa được công khai</h4>
                            <p className="text-sm text-blue-600 mt-1">
                                Học viên sẽ không thể nhìn thấy khóa học này. Hãy thêm đầy đủ chương và bài học, sau đó
                                nhấn nút
                                <strong> "Xuất bản"</strong> ở góc phải màn hình để ra mắt khóa học nhé!
                            </p>
                        </div>
                    </div>
                )}

                <div className="mb-6">
                    <CourseInfoForm course={course} />
                </div>

                {/* ===== CO-INSTRUCTOR SECTION ===== */}
                <div className="mb-6">
                    <CoInstructorManagerSection course={course} refetch={refetchCourse} />
                </div>

                {/* ===== QUIZ SECTION ===== */}
                <div className="bg-white border rounded-xl p-4 sm:p-6 mb-6 sm:mb-8 shadow-sm">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4 mb-4">
                        <h2 className="text-base sm:text-lg font-bold text-gray-800 flex items-center gap-2">
                            <ClipboardList className="w-5 h-5 sm:w-6 sm:h-6 text-purple-600" /> Quiz của khóa học
                        </h2>
                        <button
                            onClick={() => {
                                if (!firstLessonId) {
                                    toast.error('Vui lòng tạo ít nhất một bài học trước khi tạo Quiz.');
                                    return;
                                }
                                navigate(`/instructor/lessons/${firstLessonId}/quizzes/create`, {
                                    state: { courseId: course.courseId },
                                });
                            }}
                            className="flex items-center justify-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors shadow-sm text-sm font-medium w-full sm:w-auto"
                        >
                            <PlusCircle className="w-4 h-4 sm:w-5 sm:h-5" /> Tạo Quiz
                        </button>
                    </div>

                    {quizzes.length > 0 ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                            {quizzes.map((quiz: any) => (
                                <div
                                    key={quiz.quizId}
                                    className="flex items-center justify-between border border-gray-100 rounded-lg p-4 hover:border-purple-200 hover:bg-purple-50 transition-all group"
                                >
                                    <div>
                                        <p className="font-semibold text-gray-800">{quiz.title}</p>
                                        <p className="text-xs text-gray-500 mt-1">
                                            {quiz.questions?.length || 0} câu hỏi • Điểm đạt {quiz.passingScore}%
                                        </p>
                                    </div>
                                    <button
                                        onClick={() =>
                                            navigate(`/instructor/lessons/${firstLessonId}/quizzes/${quiz.quizId}/edit`)
                                        }
                                        className="p-2 text-purple-600 hover:bg-purple-100 rounded-full transition-colors"
                                    >
                                        <Edit3 size={18} />
                                    </button>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-8 bg-gray-50 rounded-lg border border-dashed border-gray-200 text-sm text-gray-600">
                            Chưa có quiz nào cho khóa học này.
                        </div>
                    )}
                </div>

                {/* Curriculum Editor Component */}
                <CurriculumEditor courseId={course.courseId} modules={course.modules || []} refetch={refetchCourse} />
            </div>
        </div>
    );
};

// Helper component to integrate CoInstructorManager with auth store
const CoInstructorManagerSection = ({ course, refetch }: { course: any; refetch: () => void }) => {
    const { user } = useAuthStore();

    // Build co-instructors list including owner
    const allInstructors = [
        {
            userId: course.instructor?.userId,
            fullName: course.instructor?.fullName || '',
            email: '',
            avatarUrl: course.instructor?.avatarUrl,
            role: 'OWNER',
            addedAt: course.createdAt,
        },
        ...(course.coInstructors || []),
    ];

    // Check if current user is the owner
    const isOwner = user?.userId === course.instructor?.userId;

    return (
        <CoInstructorManager
            courseId={course.courseId}
            coInstructors={allInstructors}
            isOwner={isOwner}
            refetch={refetch}
        />
    );
};
