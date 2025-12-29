import { useQuery } from '@apollo/client';
import { GET_COURSE_RATING } from '../../graphql/queries/course';
import { gql } from '@apollo/client';

const GET_COURSE_REVIEWS = gql`
  query GetCourseReviews($courseId: UUID!) {
    getReviewsByCourse(courseId: $courseId) {
      reviewId
    }
  }
`;

interface CourseRatingBadgeProps {
  courseId: string;
}

export const CourseRatingBadge = ({ courseId }: CourseRatingBadgeProps) => {
  const { data: ratingData } = useQuery(GET_COURSE_RATING, {
    variables: { courseId },
    skip: !courseId,
  });

  const { data: reviewsData } = useQuery(GET_COURSE_REVIEWS, {
    variables: { courseId },
    skip: !courseId,
  });

  const rating = ratingData?.getCourseAverageRating || 0;
  const reviewCount = reviewsData?.getReviewsByCourse?.length || 0;

  if (!rating || rating === 0) return null;

  return (
    <div className="absolute bottom-3 left-3 bg-white bg-opacity-95 backdrop-blur px-2 py-1 rounded-lg flex items-center gap-1">
      <span className="text-yellow-400">⭐</span>
      <span className="font-bold text-gray-800">{rating.toFixed(1)}</span>
      <span className="text-xs text-gray-600">({reviewCount})</span>
    </div>
  );
};
