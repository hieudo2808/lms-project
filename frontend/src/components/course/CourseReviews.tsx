import { formatShortDate } from '../../utils';

interface Review {
    reviewId: string;
    rating: number;
    comment?: string;
    createdAt: string;
    user?: {
        fullName: string;
        avatarUrl?: string;
    };
}

interface CourseReviewsProps {
    reviews: Review[];
    averageRating: number;
    isPreviewMode: boolean;
    hasExistingReview: boolean;
    reviewRating: number;
    reviewComment: string;
    onRatingChange: (rating: number) => void;
    onCommentChange: (comment: string) => void;
    onSubmitReview: () => void;
    isSubmitting: boolean;
}

export const CourseReviews = ({
    reviews,
    averageRating,
    isPreviewMode,
    hasExistingReview,
    reviewRating,
    reviewComment,
    onRatingChange,
    onCommentChange,
    onSubmitReview,
    isSubmitting,
}: CourseReviewsProps) => {
    return (
        <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm space-y-6">
            <div className="flex items-center justify-between gap-4 flex-wrap">
                <div>
                    <h2 className="text-2xl font-bold text-gray-900">Đánh giá khóa học</h2>
                    <p className="text-sm text-gray-500">Chia sẻ trải nghiệm của bạn sau khi học.</p>
                </div>
                <div className="text-right">
                    <div className="text-3xl font-bold text-amber-500">{averageRating?.toFixed(1) || '0.0'}</div>
                    <div className="text-sm text-gray-500">{reviews.length} đánh giá</div>
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
                                    onClick={() => onRatingChange(star)}
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
                        onChange={(e) => onCommentChange(e.target.value)}
                        placeholder="Ghi lại cảm nhận của bạn..."
                        className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        rows={3}
                    />
                    <div className="flex justify-end">
                        <button
                            onClick={onSubmitReview}
                            disabled={isSubmitting}
                            className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-blue-700 disabled:opacity-60"
                        >
                            {hasExistingReview ? 'Cập nhật đánh giá' : 'Gửi đánh giá'}
                        </button>
                    </div>
                </div>
            ) : (
                <p className="text-amber-600 text-sm italic bg-amber-50 border border-amber-200 rounded-lg p-3">
                    👁️ Chế độ xem trước - Không thể đánh giá khóa học
                </p>
            )}

            <div className="space-y-4">
                {reviews.map((review) => (
                    <div key={review.reviewId} className="border border-gray-200 rounded-lg p-4">
                        <div className="flex items-center gap-3 mb-2">
                            <img
                                src={review.user?.avatarUrl || 'https://via.placeholder.com/40'}
                                alt={review.user?.fullName}
                                className="w-10 h-10 rounded-full object-cover"
                            />
                            <div className="flex-1">
                                <div className="font-semibold text-gray-900">{review.user?.fullName}</div>
                                <div className="text-xs text-gray-500">{formatShortDate(review.createdAt)}</div>
                            </div>
                            <div className="text-amber-500 text-sm font-semibold">⭐ {review.rating}</div>
                        </div>
                        <p className="text-gray-700 text-sm">{review.comment}</p>
                    </div>
                ))}

                {reviews.length === 0 && <p className="text-gray-500">Chưa có đánh giá nào.</p>}
            </div>
        </div>
    );
};
