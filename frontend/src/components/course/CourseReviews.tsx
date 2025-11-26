import { useEffect, useState } from 'react';
import type { Review } from '../../types';
import { reviewAPI } from '../../services/api';
import { useAuthStore } from '../../lib/store';

interface CourseReviewsProps {
  courseId: string;
  isEnrolled: boolean;
}

export const CourseReviews = ({ courseId, isEnrolled }: CourseReviewsProps) => {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [isReviewLoading, setIsReviewLoading] = useState(false);
  const [newRating, setNewRating] = useState<number>(5);
  const [newComment, setNewComment] = useState('');
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);
  const [reviewError, setReviewError] = useState<string | null>(null);

  const { auth } = useAuthStore();

  // load reviews
  useEffect(() => {
    const fetchReviews = async () => {
      try {
        setIsReviewLoading(true);
        setReviewError(null);

        // TODO: khi có backend thì dùng:
        // const res = await reviewAPI.getCourseReviews(courseId);
        // setReviews(res.data);

        const mockReviews: Review[] = [
          {
            id: 'r1',
            courseId,
            userId: 'u1',
            userName: 'Trần Văn B',
            userAvatarUrl: undefined,
            rating: 5,
            comment: 'Khóa học rất chi tiết, ví dụ dễ hiểu.',
            createdAt: new Date().toISOString(),
          },
          {
            id: 'r2',
            courseId,
            userId: 'u2',
            userName: 'Lê Thị C',
            userAvatarUrl: undefined,
            rating: 4,
            comment: 'Nội dung tốt, nếu có thêm bài tập thì càng tuyệt.',
            createdAt: new Date().toISOString(),
          },
        ];
        setReviews(mockReviews);
      } catch (err) {
        console.error(err);
        setReviewError('Không tải được đánh giá.');
      } finally {
        setIsReviewLoading(false);
      }
    };

    fetchReviews();
  }, [courseId]);

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!newComment.trim()) {
      setReviewError('Vui lòng nhập nội dung đánh giá.');
      return;
    }

    try {
      setIsSubmittingReview(true);
      setReviewError(null);

      // TODO: gọi API thật
      // const res = await reviewAPI.createReview(courseId, newRating, newComment);
      // const created = res.data;

      const created: Review = {
        id: crypto.randomUUID?.() || Date.now().toString(),
        courseId,
        userId: auth?.user.id || 'me',
        userName: auth?.user.fullName || 'Bạn',
        userAvatarUrl: auth?.user.avatarUrl,
        rating: newRating,
        comment: newComment.trim(),
        createdAt: new Date().toISOString(),
      };

      setReviews((prev) => [created, ...prev]);
      setNewComment('');
      setNewRating(5);
    } catch (err) {
      console.error(err);
      setReviewError('Gửi đánh giá thất bại. Vui lòng thử lại.');
    } finally {
      setIsSubmittingReview(false);
    }
  };

  return (
    <div className="mt-12">
      <h2 className="text-2xl font-bold text-gray-900 mb-4">
        ⭐ Đánh giá khóa học
      </h2>

      {isEnrolled ? (
        <div className="mb-8 p-6 bg-white border border-gray-200 rounded-xl shadow-sm">
          <h3 className="font-semibold text-gray-800 mb-4">
            Viết đánh giá của bạn
          </h3>
          {reviewError && (
            <p className="text-sm text-red-600 mb-3">{reviewError}</p>
          )}
          <form onSubmit={handleSubmitReview} className="space-y-4">
            <div className="flex items-center gap-3">
              <label className="text-sm font-medium text-gray-700">
                Số sao:
              </label>
              <select
                value={newRating}
                onChange={(e) => setNewRating(Number(e.target.value))}
                className="border border-gray-300 rounded-lg px-3 py-2 text-sm"
              >
                {[5, 4, 3, 2, 1].map((star) => (
                  <option key={star} value={star}>
                    {star} ⭐
                  </option>
                ))}
              </select>
            </div>

            <div>
              <textarea
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                rows={3}
                placeholder="Chia sẻ cảm nhận của bạn về khóa học..."
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <button
              type="submit"
              disabled={isSubmittingReview}
              className="px-4 py-2 rounded-lg bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 disabled:opacity-60"
            >
              {isSubmittingReview ? 'Đang gửi...' : 'Gửi đánh giá'}
            </button>
          </form>
        </div>
      ) : (
        <p className="text-sm text-gray-500 mb-6">
          Hãy đăng ký khóa học để có thể viết đánh giá.
        </p>
      )}

      <div className="space-y-4">
        {isReviewLoading && <p>Đang tải đánh giá...</p>}

        {!isReviewLoading && reviews.length === 0 && (
          <p className="text-gray-500 text-sm">
            Chưa có đánh giá nào cho khóa học này.
          </p>
        )}

        {reviews.map((review) => (
          <div
            key={review.id}
            className="p-4 bg-white rounded-xl border border-gray-200 shadow-sm"
          >
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white font-bold">
                {review.userName[0]}
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <p className="font-semibold text-gray-900">
                    {review.userName}
                  </p>
                  <p className="text-xs text-gray-500">
                    {new Date(review.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <p className="text-sm text-yellow-500 mt-1">
                  {'⭐'.repeat(review.rating)}
                  <span className="text-gray-500 ml-1 text-xs">
                    ({review.rating}/5)
                  </span>
                </p>
                <p className="text-sm text-gray-700 mt-2">
                  {review.comment}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
