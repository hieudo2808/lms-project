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

import {
    CourseHeader,
    CourseOverview,
    CourseCurriculum,
    CourseDiscussion,
    CourseReviews,
    CourseQuizzes,
    CourseSidebar,
} from '../../components/course';

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
            const firstLesson = course?.modules?.[0]?.lessons?.[0];
            if (firstLesson?.lessonId) {
                navigate(`/courses/${slug}/lesson/${firstLesson.lessonId}`);
            } else {
                navigate(`/courses/${slug}/progress`);
            }
            return;
        }

        if (course?.price > 0) {
            navigate(`/payment/${courseId}`);
        } else {
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
            <CourseHeader course={course} averageRating={averageRating} />

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
                        <CourseOverview description={course.description} instructor={course.instructor} />
                    )}

                    {selectedTab === 'lessons' && (
                        <CourseCurriculum
                            modules={modules}
                            selectedLessonId={selectedLessonId}
                            onSelectLesson={setSelectedLessonId}
                            totalLessons={lessons.length}
                        />
                    )}

                    {selectedTab === 'discussions' && (
                        <CourseDiscussion
                            lessons={lessons}
                            selectedLessonId={selectedLessonId}
                            onSelectLesson={setSelectedLessonId}
                            comments={commentsData?.getCommentsByLesson || []}
                            commentsLoading={commentsLoading}
                            isPreviewMode={isPreviewMode}
                            commentText={commentText}
                            onCommentTextChange={setCommentText}
                            onAddComment={handleAddComment}
                            isCommentSubmitting={isCommentSubmitting}
                            replyingToId={replyingToId}
                            replyText={replyText}
                            onReplyTextChange={setReplyText}
                            onSetReplyingTo={setReplyingToId}
                            onAddReply={handleAddReply}
                        />
                    )}

                    {selectedTab === 'reviews' && (
                        <CourseReviews
                            reviews={reviewList}
                            averageRating={averageRating}
                            isPreviewMode={isPreviewMode}
                            hasExistingReview={!!myReviewData?.myReviewForCourse}
                            reviewRating={reviewRating}
                            reviewComment={reviewComment}
                            onRatingChange={setReviewRating}
                            onCommentChange={setReviewComment}
                            onSubmitReview={handleSubmitReview}
                            isSubmitting={isReviewSubmitting}
                        />
                    )}

                    {selectedTab === 'quizzes' && (
                        <CourseQuizzes
                            lessons={lessons}
                            selectedLessonId={selectedLessonId}
                            onSelectLesson={setSelectedLessonId}
                            quizzes={quizzesData?.getQuizzesByLesson || []}
                            quizzesLoading={quizzesLoading}
                            isPreviewMode={isPreviewMode}
                        />
                    )}
                </div>

                <CourseSidebar
                    courseId={courseId || ''}
                    slug={slug || ''}
                    price={course.price || 0}
                    isEnrolled={isEnrolled}
                    isEnrollLoading={isEnrollLoading}
                    isPreviewMode={isPreviewMode}
                    onEnroll={handleEnroll}
                />
            </div>
        </Layout>
    );
};
