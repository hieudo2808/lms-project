import { useEffect, useMemo, useState } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { useQuery, useMutation } from '@apollo/client';

import { Layout } from '../../components/common/Layout';
import { useAuthStore } from '../../lib/store';
import { GET_COURSE_BY_SLUG, GET_MY_ENROLLMENTS } from '../../graphql/queries/course';
import { ENROLL_COURSE_MUTATION } from '../../graphql/mutations/enrollment';
import { GET_COMMENTS_BY_LESSON } from '../../graphql/queries/comment';
import { CREATE_COMMENT_MUTATION } from '../../graphql/mutations/comment';
import { GET_COURSE_REVIEWS, GET_MY_REVIEW_FOR_COURSE } from '../../graphql/queries/review';
import { CREATE_REVIEW_MUTATION, UPDATE_REVIEW_MUTATION } from '../../graphql/mutations/review';
import { GET_QUIZ_BY_LESSON } from '../../graphql/queries/quiz';

const formatMinutes = (seconds?: number) => {
    if (!seconds) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = (seconds % 60).toString().padStart(2, '0');
    return `${mins}:${secs}`;
};

const formatDate = (value?: string) => {
    if (!value) return '';
    return new Date(value).toLocaleDateString();
};

const tabs = [
    { key: 'overview', label: 'Tổng quan' },
    { key: 'lessons', label: 'Bài học' },
    { key: 'discussions', label: 'Thảo luận' },
    { key: 'reviews', label: 'Đánh giá' },
    { key: 'quizzes', label: 'Quiz' },
];

export const CourseDetailPage = () => {
    const { slug } = useParams();
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const isPreviewMode = searchParams.get('preview') === 'true';
    const { user } = useAuthStore();

    const [courseId, setCourseId] = useState<string | null>(null);
    const [isEnrolled, setIsEnrolled] = useState(false);
    const [selectedTab, setSelectedTab] = useState<string>('overview');
    const [selectedLessonId, setSelectedLessonId] = useState<string | null>(null);
    const [commentText, setCommentText] = useState('');
    const [reviewRating, setReviewRating] = useState<number>(5);
    const [reviewComment, setReviewComment] = useState('');
    const [replyingToId, setReplyingToId] = useState<string | null>(null);
    const [replyText, setReplyText] = useState('');

    const { data, loading, error } = useQuery(GET_COURSE_BY_SLUG, {
        variables: { slug },
    });

    const { data: enrollmentsData } = useQuery(GET_MY_ENROLLMENTS, {
        skip: !user,
        fetchPolicy: 'cache-and-network',
    });

    const {
        data: commentsData,
        loading: commentsLoading,
        refetch: refetchComments,
    } = useQuery(GET_COMMENTS_BY_LESSON, {
        variables: { lessonId: selectedLessonId },
        skip: !selectedLessonId,
        fetchPolicy: 'cache-and-network',
    });

    const { data: reviewsData, refetch: refetchReviews } = useQuery(GET_COURSE_REVIEWS, {
        variables: { courseId },
        skip: !courseId,
        fetchPolicy: 'cache-and-network',
    });

    const { data: myReviewData, refetch: refetchMyReview } = useQuery(GET_MY_REVIEW_FOR_COURSE, {
        variables: { courseId },
        skip: !courseId || !user?.userId,
        fetchPolicy: 'cache-and-network',
        errorPolicy: 'ignore',
    });

    const { data: quizzesData, loading: quizzesLoading } = useQuery(GET_QUIZ_BY_LESSON, {
        variables: { lessonId: selectedLessonId },
        skip: !selectedLessonId,
        fetchPolicy: 'cache-and-network',
    });

    const [enrollMutation, { loading: isEnrollLoading }] = useMutation(ENROLL_COURSE_MUTATION, {
        onCompleted: () => {
            alert('Đăng ký thành công!');
            navigate('/dashboard/my-courses');
        },
        onError: (err) => {
            alert('Lỗi: ' + err.message);
        },
    });

    const [createComment, { loading: isCommentSubmitting }] = useMutation(CREATE_COMMENT_MUTATION, {
        onCompleted: () => {
            setCommentText('');
            refetchComments();
        },
        onError: () => {
            alert('Bạn cần đăng nhập để bình luận.');
        },
    });

    const [createReview, { loading: isReviewSubmitting }] = useMutation(CREATE_REVIEW_MUTATION, {
        onCompleted: () => {
            refetchReviews();
            refetchMyReview();
        },
        onError: () => {
            alert('Bạn cần đăng nhập để đánh giá.');
        },
    });

    const [updateReview] = useMutation(UPDATE_REVIEW_MUTATION, {
        onCompleted: () => {
            refetchReviews();
            refetchMyReview();
        },
        onError: () => {
            alert('Bạn cần đăng nhập để cập nhật đánh giá.');
        },
    });

    useEffect(() => {
        if (myReviewData?.myReviewForCourse) {
            setReviewRating(myReviewData.myReviewForCourse.rating);
            setReviewComment(myReviewData.myReviewForCourse.comment || '');
        }
    }, [myReviewData]);

    useEffect(() => {
        const foundCourse = data?.getCourseBySlug;
        if (foundCourse?.courseId) {
            setCourseId(foundCourse.courseId);
            const firstLesson = foundCourse.modules?.[0]?.lessons?.[0];
            if (firstLesson?.lessonId) {
                setSelectedLessonId(firstLesson.lessonId);
            }
        }
    }, [data]);

    useEffect(() => {
        if (!courseId || !enrollmentsData?.myEnrollments) return;
        const enrolled = enrollmentsData.myEnrollments.some((enroll: any) => enroll.course.courseId === courseId);
        setIsEnrolled(enrolled);
    }, [courseId, enrollmentsData]);

    const modules = data?.getCourseBySlug?.modules || [];
    const course = data?.getCourseBySlug;

    const lessons = useMemo(() => {
        return modules.flatMap(
            (module: any) =>
                module.lessons?.map((lesson: any) => ({
                    ...lesson,
                    moduleTitle: module.title,
                })) || [],
        );
    }, [modules]);

    const selectedLesson = lessons.find((lesson: any) => lesson.lessonId === selectedLessonId);

    const averageRating = reviewsData?.getCourseAverageRating || 0;
    const reviewList = reviewsData?.getReviewsByCourse || [];

    const handleEnroll = async () => {
        if (!user) {
            alert('Vui lòng đăng nhập để đăng ký khóa học.');
            navigate('/login');
            return;
        }
        if (!courseId) return;

        if (isEnrolled) {
            // Navigate to first lesson if available, otherwise to progress page
            const firstLesson = course?.modules?.[0]?.lessons?.[0];
            if (firstLesson?.lessonId) {
                navigate(`/courses/${slug}/lesson/${firstLesson.lessonId}`);
            } else {
                navigate(`/courses/${slug}/progress`);
            }
            return;
        }

        // Check if course is free or requires payment
        if (course?.price > 0) {
            // Navigate to payment page
            navigate(`/payment/${courseId}`);
        } else {
            // Free course - enroll directly
            enrollMutation({ variables: { courseId } });
        }
    };

    const handleAddComment = () => {
        if (!user) {
            alert('Vui lòng đăng nhập để thảo luận.');
            return;
        }
        if (!commentText.trim() || !selectedLessonId) return;

        createComment({
            variables: {
                input: {
                    lessonId: selectedLessonId,
                    content: commentText.trim(),
                },
            },
        });
    };

    const handleAddReply = (parentCommentId: string) => {
        if (!user) {
            alert('Vui lòng đăng nhập để trả lời.');
            return;
        }
        if (!replyText.trim() || !selectedLessonId) return;

        createComment({
            variables: {
                input: {
                    lessonId: selectedLessonId,
                    content: replyText.trim(),
                    parentCommentId,
                },
            },
        }).then(() => {
            setReplyText('');
            setReplyingToId(null);
        });
    };

    const handleSubmitReview = () => {
        if (!user) {
            alert('Vui lòng đăng nhập để đánh giá.');
            return;
        }
        if (!courseId) return;

        if (myReviewData?.myReviewForCourse) {
            updateReview({
                variables: {
                    reviewId: myReviewData.myReviewForCourse.reviewId,
                    input: {
                        rating: reviewRating,
                        comment: reviewComment,
                    },
                },
            });
        } else {
            createReview({
                variables: {
                    input: {
                        courseId,
                        rating: reviewRating,
                        comment: reviewComment,
                    },
                },
            });
        }
    };

    if (loading)
        return (
            <Layout>
                <div className="flex justify-center items-center h-[50vh]">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" />
                </div>
            </Layout>
        );

    if (error || !course)
        return (
            <Layout>
                <div className="text-center py-20">
                    <h2 className="text-2xl font-bold text-red-600">Không tìm thấy khóa học</h2>
                    <button onClick={() => navigate('/')} className="text-blue-600 underline mt-4">
                        Quay về trang chủ
                    </button>
                </div>
            </Layout>
        );

    return (
        <Layout>
            <div className="bg-slate-900 text-white py-16">
                <div className="max-w-7xl mx-auto px-4 grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
                    <div>
                        <h1 className="text-4xl font-bold mb-3 leading-tight">{course.title}</h1>
                        <p className="text-gray-300 text-lg mb-5 line-clamp-3">{course.description}</p>

                        <div className="flex flex-wrap gap-3 text-sm font-medium items-center">
                            <span className="bg-blue-600 px-3 py-1 rounded">Cấp độ: {course.level}</span>
                            <span className="bg-gray-700 px-3 py-1 rounded">
                                ⏱ {formatMinutes(course.totalDuration)}
                            </span>
                            <span className="bg-gray-700 px-3 py-1 rounded">📚 {course.totalLessons || 0} bài học</span>
                            <span className="bg-amber-500/20 text-amber-200 px-3 py-1 rounded">
                                ⭐ {averageRating?.toFixed(1) || '0.0'} / 5
                            </span>
                        </div>
                    </div>
                    <div>
                        <img
                            src={course.thumbnailUrl || 'https://via.placeholder.com/600x400'}
                            alt={course.title}
                            className="rounded-xl shadow-2xl w-full object-cover border border-gray-700"
                        />
                    </div>
                </div>
            </div>

            <div className="bg-white shadow-sm border-b border-gray-200">
                <div className="max-w-7xl mx-auto px-4 flex gap-4 overflow-x-auto">
                    {tabs.map((tab) => (
                        <button
                            key={tab.key}
                            onClick={() => setSelectedTab(tab.key)}
                            className={`py-4 px-3 text-sm font-semibold border-b-2 transition-colors ${
                                selectedTab === tab.key
                                    ? 'border-blue-600 text-blue-600'
                                    : 'border-transparent text-gray-500 hover:text-gray-800'
                            }`}
                        >
                            {tab.label}
                        </button>
                    ))}
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 py-10 grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-8">
                    {selectedTab === 'overview' && (
                        <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
                            <h2 className="text-2xl font-bold mb-4 text-gray-900">Bạn sẽ học được gì</h2>
                            <p className="text-gray-700 leading-relaxed">
                                {course.description ||
                                    'Khóa học giúp bạn nắm vững kiến thức cốt lõi và thực hành qua dự án thực tế.'}
                            </p>

                            {course.instructor && (
                                <div className="mt-8 border-t border-gray-100 pt-6 flex items-center gap-4">
                                    <img
                                        src={course.instructor.avatarUrl || 'https://via.placeholder.com/80'}
                                        alt={course.instructor.fullName}
                                        className="w-14 h-14 rounded-full object-cover"
                                    />
                                    <div>
                                        <div className="font-semibold text-gray-900">{course.instructor.fullName}</div>
                                        <div className="text-gray-500 text-sm">
                                            {course.instructor.bio || 'Giảng viên uy tín tại LMS'}
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {selectedTab === 'lessons' && (
                        <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm space-y-4">
                            <div className="flex items-center justify-between">
                                <h2 className="text-2xl font-bold text-gray-900">Nội dung bài học</h2>
                                <div className="text-sm text-gray-500">{lessons.length} bài học</div>
                            </div>

                            {modules.length === 0 && <p className="text-gray-500">Chưa có nội dung.</p>}

                            <div className="space-y-4">
                                {modules.map((module: any) => (
                                    <div
                                        key={module.moduleId}
                                        className="border border-gray-200 rounded-lg overflow-hidden"
                                    >
                                        <div className="bg-gray-50 px-4 py-3 font-semibold text-gray-800 border-b border-gray-200 flex items-center justify-between">
                                            <span>{module.title}</span>
                                            <span className="text-xs text-gray-500">
                                                {module.lessons?.length || 0} bài
                                            </span>
                                        </div>
                                        <div className="divide-y divide-gray-100">
                                            {module.lessons?.map((lesson: any) => (
                                                <button
                                                    key={lesson.lessonId}
                                                    onClick={() => setSelectedLessonId(lesson.lessonId)}
                                                    className={`w-full text-left px-4 py-3 flex items-center gap-3 hover:bg-blue-50 transition-colors ${
                                                        selectedLessonId === lesson.lessonId
                                                            ? 'bg-blue-50 border-l-4 border-blue-600'
                                                            : ''
                                                    }`}
                                                >
                                                    <span className="text-blue-500">▶</span>
                                                    <div className="flex-1">
                                                        <div className="text-gray-800 text-sm font-semibold">
                                                            {lesson.title}
                                                        </div>
                                                        <div className="text-xs text-gray-500">{module.title}</div>
                                                    </div>
                                                    <span className="text-xs text-gray-400">
                                                        {formatMinutes(lesson.durationSeconds)}
                                                    </span>
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {selectedTab === 'discussions' && (
                        <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm space-y-6">
                            <div className="flex items-center justify-between gap-4 flex-wrap">
                                <div>
                                    <h2 className="text-2xl font-bold text-gray-900">Thảo luận bài học</h2>
                                    <p className="text-sm text-gray-500">Chọn bài học để xem và tạo bình luận.</p>
                                </div>
                                <select
                                    value={selectedLessonId || ''}
                                    onChange={(e) => setSelectedLessonId(e.target.value)}
                                    className="border border-gray-300 rounded-lg px-3 py-2 text-sm"
                                >
                                    <option value="" disabled>
                                        Chọn bài học
                                    </option>
                                    {lessons.map((lesson: any) => (
                                        <option key={lesson.lessonId} value={lesson.lessonId}>
                                            {lesson.title}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {!selectedLesson && <p className="text-gray-500">Hãy chọn một bài học để xem thảo luận.</p>}

                            {selectedLesson && (
                                <div className="space-y-4">
                                    {!isPreviewMode && (
                                        <div className="flex gap-3">
                                            <textarea
                                                value={commentText}
                                                onChange={(e) => setCommentText(e.target.value)}
                                                placeholder="Chia sẻ thắc mắc của bạn..."
                                                className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                rows={3}
                                            />
                                            <button
                                                onClick={handleAddComment}
                                                disabled={isCommentSubmitting || !commentText.trim()}
                                                className="h-fit bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-blue-700 disabled:opacity-60"
                                            >
                                                {isCommentSubmitting ? 'Đang gửi...' : 'Gửi'}
                                            </button>
                                        </div>
                                    )}
                                    {isPreviewMode && (
                                        <p className="text-amber-600 text-sm italic">
                                            👁️ Chế độ xem trước - Không thể bình luận
                                        </p>
                                    )}

                                    {commentsLoading && <p className="text-gray-500">Đang tải bình luận...</p>}
                                    {!commentsLoading && (commentsData?.getCommentsByLesson?.length || 0) === 0 && (
                                        <p className="text-gray-500">Chưa có bình luận. Hãy là người đầu tiên!</p>
                                    )}

                                    <div className="space-y-4">
                                        {commentsData?.getCommentsByLesson?.map((comment: any) => (
                                            <div
                                                key={comment.commentId}
                                                className="border border-gray-200 rounded-lg p-4 bg-gray-50"
                                            >
                                                <div className="flex items-center gap-3 mb-2">
                                                    <img
                                                        src={
                                                            comment.user?.avatarUrl || 'https://via.placeholder.com/40'
                                                        }
                                                        alt={comment.user?.fullName}
                                                        className="w-10 h-10 rounded-full object-cover"
                                                    />
                                                    <div>
                                                        <div className="font-semibold text-gray-800">
                                                            {comment.user?.fullName}
                                                        </div>
                                                        <div className="text-xs text-gray-500">
                                                            {formatDate(comment.createdAt)}
                                                        </div>
                                                    </div>
                                                </div>
                                                <p className="text-gray-700 text-sm mb-2">{comment.content}</p>

                                                {/* Reply Button */}
                                                <button
                                                    onClick={() =>
                                                        setReplyingToId(
                                                            replyingToId === comment.commentId
                                                                ? null
                                                                : comment.commentId,
                                                        )
                                                    }
                                                    className="text-xs text-blue-600 hover:text-blue-700 font-medium"
                                                >
                                                    {replyingToId === comment.commentId ? 'Hủy' : 'Trả lời'}
                                                </button>

                                                {/* Reply Input */}
                                                {replyingToId === comment.commentId && (
                                                    <div className="mt-3 flex gap-2">
                                                        <input
                                                            type="text"
                                                            placeholder="Viết câu trả lời..."
                                                            value={replyText}
                                                            onChange={(e) => setReplyText(e.target.value)}
                                                            className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                        />
                                                        <button
                                                            onClick={() => handleAddReply(comment.commentId)}
                                                            disabled={!replyText.trim()}
                                                            className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-blue-700 disabled:opacity-60"
                                                        >
                                                            Gửi
                                                        </button>
                                                    </div>
                                                )}

                                                {comment.replies?.length > 0 && (
                                                    <div className="mt-3 pl-4 border-l-2 border-gray-300 space-y-2">
                                                        {comment.replies.map((reply: any) => (
                                                            <div key={reply.commentId} className="flex gap-3">
                                                                <img
                                                                    src={
                                                                        reply.user?.avatarUrl ||
                                                                        'https://via.placeholder.com/32'
                                                                    }
                                                                    alt={reply.user?.fullName}
                                                                    className="w-8 h-8 rounded-full object-cover"
                                                                />
                                                                <div>
                                                                    <div className="text-sm font-semibold text-gray-800">
                                                                        {reply.user?.fullName}
                                                                    </div>
                                                                    <div className="text-xs text-gray-500">
                                                                        {formatDate(reply.createdAt)}
                                                                    </div>
                                                                    <p className="text-sm text-gray-700">
                                                                        {reply.content}
                                                                    </p>
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {selectedTab === 'reviews' && (
                        <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm space-y-6">
                            <div className="flex items-center justify-between gap-4 flex-wrap">
                                <div>
                                    <h2 className="text-2xl font-bold text-gray-900">Đánh giá khóa học</h2>
                                    <p className="text-sm text-gray-500">Chia sẻ trải nghiệm của bạn sau khi học.</p>
                                </div>
                                <div className="text-right">
                                    <div className="text-3xl font-bold text-amber-500">
                                        {averageRating?.toFixed(1) || '0.0'}
                                    </div>
                                    <div className="text-sm text-gray-500">{reviewList.length} đánh giá</div>
                                </div>
                            </div>

                            {!isPreviewMode ? (
                                <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 flex flex-col gap-3">
                                    <div className="flex items-center gap-3">
                                        <span className="text-sm font-semibold text-gray-700">Chọn sao:</span>
                                        <div className="flex gap-2">
                                            {[1, 2, 3, 4, 5].map((star) => (
                                                <button
                                                    key={star}
                                                    onClick={() => setReviewRating(star)}
                                                    className={`w-10 h-10 rounded-full border flex items-center justify-center ${
                                                        reviewRating >= star
                                                            ? 'bg-amber-100 border-amber-300 text-amber-600'
                                                            : 'border-gray-200 text-gray-400'
                                                    }`}
                                                >
                                                    ⭐
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                    <textarea
                                        value={reviewComment}
                                        onChange={(e) => setReviewComment(e.target.value)}
                                        placeholder="Ghi lại cảm nhận của bạn..."
                                        className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        rows={3}
                                    />
                                    <div className="flex justify-end">
                                        <button
                                            onClick={handleSubmitReview}
                                            disabled={isReviewSubmitting}
                                            className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-blue-700 disabled:opacity-60"
                                        >
                                            {reviewsData?.myReviewForCourse ? 'Cập nhật đánh giá' : 'Gửi đánh giá'}
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <p className="text-amber-600 text-sm italic bg-amber-50 border border-amber-200 rounded-lg p-3">
                                    👁️ Chế độ xem trước - Không thể đánh giá khóa học
                                </p>
                            )}

                            <div className="space-y-4">
                                {reviewList.map((review: any) => (
                                    <div key={review.reviewId} className="border border-gray-200 rounded-lg p-4">
                                        <div className="flex items-center gap-3 mb-2">
                                            <img
                                                src={review.user?.avatarUrl || 'https://via.placeholder.com/40'}
                                                alt={review.user?.fullName}
                                                className="w-10 h-10 rounded-full object-cover"
                                            />
                                            <div className="flex-1">
                                                <div className="font-semibold text-gray-900">
                                                    {review.user?.fullName}
                                                </div>
                                                <div className="text-xs text-gray-500">
                                                    {formatDate(review.createdAt)}
                                                </div>
                                            </div>
                                            <div className="text-amber-500 text-sm font-semibold">
                                                ⭐ {review.rating}
                                            </div>
                                        </div>
                                        <p className="text-gray-700 text-sm">{review.comment}</p>
                                    </div>
                                ))}

                                {reviewList.length === 0 && <p className="text-gray-500">Chưa có đánh giá nào.</p>}
                            </div>
                        </div>
                    )}

                    {selectedTab === 'quizzes' && (
                        <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm space-y-4">
                            <div className="flex items-center justify-between gap-4 flex-wrap">
                                <div>
                                    <h2 className="text-2xl font-bold text-gray-900">Quiz theo bài học</h2>
                                    <p className="text-sm text-gray-500">Chọn bài học để xem các quiz liên quan.</p>
                                </div>
                                <select
                                    value={selectedLessonId || ''}
                                    onChange={(e) => setSelectedLessonId(e.target.value)}
                                    className="border border-gray-300 rounded-lg px-3 py-2 text-sm"
                                >
                                    <option value="" disabled>
                                        Chọn bài học
                                    </option>
                                    {lessons.map((lesson: any) => (
                                        <option key={lesson.lessonId} value={lesson.lessonId}>
                                            {lesson.title}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {!selectedLesson && <p className="text-gray-500">Hãy chọn một bài học để xem quiz.</p>}

                            {selectedLesson && (
                                <div className="space-y-4">
                                    {quizzesLoading && <p className="text-gray-500">Đang tải quiz...</p>}
                                    {!quizzesLoading && (quizzesData?.getQuizzesByLesson?.length || 0) === 0 && (
                                        <p className="text-gray-500">Bài học chưa có quiz.</p>
                                    )}

                                    {quizzesData?.getQuizzesByLesson?.map((quiz: any) => (
                                        <div
                                            key={quiz.quizId}
                                            className="border border-gray-200 rounded-lg p-4 flex items-start justify-between gap-4"
                                        >
                                            <div>
                                                <div className="text-lg font-semibold text-gray-900">{quiz.title}</div>
                                                <p className="text-sm text-gray-600">{quiz.description}</p>
                                                <div className="text-xs text-gray-500 mt-2 flex gap-3">
                                                    <span>Thời gian: {quiz.timeLimit || 0} phút</span>
                                                    <span>Điểm đạt: {quiz.passingScore}</span>
                                                </div>
                                            </div>
                                            {isPreviewMode ? (
                                                <span className="text-amber-600 text-sm italic">👁️ Xem trước</span>
                                            ) : (
                                                <button
                                                    onClick={() => navigate(`/student/quizzes/${quiz.quizId}`)}
                                                    className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-blue-700"
                                                >
                                                    Làm quiz
                                                </button>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}
                </div>

                <div className="lg:col-span-1">
                    <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-200 sticky top-24 space-y-4">
                        <div className="text-4xl font-bold text-blue-600">
                            {course.price === 0 ? 'Miễn phí' : `${(course.price ?? 0).toLocaleString()} đ`}
                        </div>
                        <p className="text-gray-500 text-sm line-through">
                            {((course.price ?? 0) * 1.5).toLocaleString()} đ
                        </p>

                        {isPreviewMode ? (
                            <div className="w-full bg-amber-100 border border-amber-300 text-amber-800 font-semibold py-4 px-4 rounded-lg text-center">
                                <div className="flex items-center justify-center gap-2 mb-1">
                                    <span>👁️</span> Chế độ xem trước
                                </div>
                                <p className="text-sm font-normal text-amber-700">
                                    Bạn đang xem trước khóa học với tư cách giảng viên/quản trị viên
                                </p>
                            </div>
                        ) : (
                            <button
                                onClick={handleEnroll}
                                disabled={isEnrollLoading}
                                className="w-full bg-blue-600 text-white font-bold py-4 rounded-lg hover:bg-blue-700 transition-all shadow-md active:transform active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed"
                            >
                                {isEnrolled ? 'Vào học' : isEnrollLoading ? 'Đang xử lý...' : 'Đăng ký ngay'}
                            </button>
                        )}

                        {isEnrolled && (
                            <button
                                onClick={() => navigate(`/courses/${slug}/progress`)}
                                className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-semibold py-3 rounded-lg hover:shadow-lg transition-all flex items-center justify-center gap-2"
                            >
                                📊 Xem tiến độ học tập
                            </button>
                        )}

                        <ul className="space-y-2 text-sm text-gray-600">
                            <li className="flex gap-2">✅ Truy cập trọn đời</li>
                            <li className="flex gap-2">✅ Học trên mọi thiết bị</li>
                            <li className="flex gap-2">✅ Cấp chứng chỉ khi hoàn thành</li>
                        </ul>
                    </div>
                </div>
            </div>
        </Layout>
    );
};
