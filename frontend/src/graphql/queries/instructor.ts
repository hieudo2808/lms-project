import { gql } from "@apollo/client";

/**
 * Instructor: lấy danh sách khóa học của tôi
 * Map với Query.getMyCourses (InstructorResolver)
 */
export const GET_MY_COURSES_QUERY = gql`
  query GetMyCourses {
    getMyCourses {
      courseId
      title
      slug
      isPublished
      price
      level
      thumbnailUrl
      createdAt
      updatedAt
      categoryName
      instructor {
        userId
        fullName
      }
    }
  }
`;
