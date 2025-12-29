import { useQuery } from '@apollo/client';
import { gql } from '@apollo/client';

const GET_COURSE_STATS = gql`
  query GetCourseStats($courseId: UUID!) {
    getCourseAverageRating(courseId: $courseId)
    getReviewsByCourse(courseId: $courseId) {
      reviewId
    }
  }
`;

interface CourseRatingProps {
  courseId: string;
}

export const CourseRating = ({ courseId }: CourseRatingProps) => {
  const { data, loading } = useQuery(GET_COURSE_STATS, {
    variables: { courseId },
    skip: !courseId,
  });

  const rating = data?.getCourseAverageRating || 0;
  const reviewCount = data?.getReviewsByCourse?.length || 0;

  if (loading) {
    return (
      <div className="flex items-center gap-1 text-gray-400 text-sm">
        <span>⭐ ...</span>
      </div>
    );
  }

  if (!rating || rating === 0) {
    return (
      <div className="flex items-center gap-1 text-gray-400 text-sm">
        <span>⭐ Chưa có đánh giá</span>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-1 text-yellow-500 text-sm font-bold">
      <span>⭐ {rating.toFixed(1)}</span>
      <span className="text-gray-400 font-normal">({reviewCount})</span>
    </div>
  );
};
