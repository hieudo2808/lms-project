import { useState } from 'react';
import { useQuery } from '@apollo/client';
import { Star, Loader2, MessageSquare, User } from 'lucide-react';
import { GET_MY_COURSES_QUERY } from '../../graphql/queries/instructor';
import { GET_COURSE_REVIEWS } from '../../graphql/queries/review';

interface Course {
    courseId: string;
    title: string;
}

interface Review {
    reviewId: string;
    rating: number;
    comment: string;
    createdAt: string;
    user: {
        fullName: string;
        avatarUrl: string | null;
    };
}

const StarRating = ({ rating }: { rating: number }) => (
    <div className="flex items-center gap-0.5">
        {[1, 2, 3, 4, 5].map((star) => (
            <Star
                key={star}
                className={`w-4 h-4 ${star <= rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`}
            />
        ))}
    </div>
);

export const ReviewsPage = () => {
    const [selectedCourseId, setSelectedCourseId] = useState<string>('');

    const { data: coursesData, loading: coursesLoading } = useQuery(GET_MY_COURSES_QUERY);
    const courses: Course[] = coursesData?.getMyCourses || [];

    const { data: reviewsData, loading: reviewsLoading } = useQuery(GET_COURSE_REVIEWS, {
        variables: { courseId: selectedCourseId },
        skip: !selectedCourseId,
    });
    const reviews: Review[] = reviewsData?.getReviewsByCourse || [];
    const averageRating: number = reviewsData?.getCourseAverageRating || 0;

    const formatDate = (dateStr: string) => {
        try {
            return new Date(dateStr).toLocaleDateString('vi-VN');
        } catch {
            return dateStr;
        }
    };

    const ratingDistribution = [5, 4, 3, 2, 1].map((rating) => ({
        rating,
        count: reviews.filter((r) => r.rating === rating).length,
        percent: reviews.length > 0 ? (reviews.filter((r) => r.rating === rating).length / reviews.length) * 100 : 0,
    }));

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                        <MessageSquare className="w-7 h-7 text-yellow-500" />
                        Đánh giá & Phản hồi
                    </h1>
                    <p className="text-gray-500 mt-1">Xem đánh giá từ học viên về khóa học của bạn</p>
                </div>
            </div>

            <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
                <label className="block text-sm font-medium text-gray-700 mb-2">Chọn khóa học</label>
                {coursesLoading ? (
                    <div className="flex items-center gap-2 text-gray-500">
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Đang tải...
                    </div>
                ) : (
                    <select
                        value={selectedCourseId}
                        onChange={(e) => setSelectedCourseId(e.target.value)}
                        className="w-full max-w-md px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                    >
                        <option value="">-- Chọn khóa học --</option>
                        {courses.map((course) => (
                            <option key={course.courseId} value={course.courseId}>
                                {course.title}
                            </option>
                        ))}
                    </select>
                )}
            </div>

            {selectedCourseId && (
                <>
                    {reviewsLoading ? (
                        <div className="flex items-center justify-center py-12">
                            <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                            <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
                                <h2 className="text-lg font-bold text-gray-800 mb-4">Tổng quan</h2>

                                <div className="text-center mb-6">
                                    <p className="text-5xl font-bold text-gray-800">{averageRating.toFixed(1)}</p>
                                    <div className="flex justify-center my-2">
                                        <StarRating rating={Math.round(averageRating)} />
                                    </div>
                                    <p className="text-sm text-gray-500">{reviews.length} đánh giá</p>
                                </div>

                                <div className="space-y-2">
                                    {ratingDistribution.map(({ rating, count, percent }) => (
                                        <div key={rating} className="flex items-center gap-2">
                                            <span className="text-sm text-gray-600 w-3">{rating}</span>
                                            <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                                            <div className="flex-1 bg-gray-200 rounded-full h-2">
                                                <div
                                                    className="bg-yellow-400 h-2 rounded-full"
                                                    style={{ width: `${percent}%` }}
                                                />
                                            </div>
                                            <span className="text-sm text-gray-500 w-8">{count}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="lg:col-span-2 bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
                                <div className="p-4 border-b bg-gray-50">
                                    <h2 className="font-bold text-gray-800">Danh sách đánh giá</h2>
                                </div>

                                {reviews.length === 0 ? (
                                    <div className="text-center py-12 text-gray-500">
                                        <MessageSquare className="w-12 h-12 mx-auto mb-3 opacity-30" />
                                        <p>Chưa có đánh giá nào</p>
                                    </div>
                                ) : (
                                    <div className="divide-y">
                                        {reviews.map((review) => (
                                            <div key={review.reviewId} className="p-4 hover:bg-gray-50">
                                                <div className="flex items-start gap-3">
                                                    <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center shrink-0">
                                                        {review.user.avatarUrl ? (
                                                            <img
                                                                src={review.user.avatarUrl}
                                                                alt=""
                                                                className="w-10 h-10 rounded-full object-cover"
                                                            />
                                                        ) : (
                                                            <User className="w-5 h-5 text-gray-400" />
                                                        )}
                                                    </div>

                                                    <div className="flex-1 min-w-0">
                                                        <div className="flex items-center justify-between mb-1">
                                                            <p className="font-medium text-gray-800">
                                                                {review.user.fullName}
                                                            </p>
                                                            <span className="text-xs text-gray-400">
                                                                {formatDate(review.createdAt)}
                                                            </span>
                                                        </div>
                                                        <StarRating rating={review.rating} />
                                                        {review.comment && (
                                                            <p className="text-gray-600 mt-2 text-sm">
                                                                {review.comment}
                                                            </p>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </>
            )}

            {!selectedCourseId && (
                <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-12 text-center">
                    <Star className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                    <p className="text-gray-500">Chọn một khóa học để xem đánh giá</p>
                </div>
            )}
        </div>
    );
};
