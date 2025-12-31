import { gql } from '@apollo/client';

export const GET_COURSE_REVIEWS = gql`
    query GetCourseReviews($courseId: UUID!) {
        getReviewsByCourse(courseId: $courseId) {
            reviewId
            rating
            comment
            createdAt
            user {
                userId
                fullName
                avatarUrl
            }
        }
        getCourseAverageRating(courseId: $courseId)
    }
`;

export const GET_MY_REVIEW_FOR_COURSE = gql`
    query GetMyReviewForCourse($courseId: UUID!) {
        myReviewForCourse(courseId: $courseId) {
            reviewId
            rating
            comment
            createdAt
            user {
                userId
                fullName
                avatarUrl
            }
        }
    }
`;
