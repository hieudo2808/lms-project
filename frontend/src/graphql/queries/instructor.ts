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

/**
 * Instructor: Lấy danh sách học viên đăng ký khóa học
 */
export const GET_COURSE_ENROLLMENTS = gql`
  query GetCourseEnrollments($courseId: UUID!) {
    getCourseEnrollments(courseId: $courseId) {
      enrollmentId
      enrolledAt
      progressPercent
      course {
        courseId
        title
      }
    }
  }
`;

/**
 * Instructor: Lấy doanh thu của khóa học
 */
export const GET_COURSE_REVENUE = gql`
  query GetCourseRevenue($courseId: UUID!) {
    getCourseRevenue(courseId: $courseId) {
      courseId
      totalRevenue
      totalEnrollments
      totalPayments
      averagePrice
    }
  }
`;

/**
 * Instructor: Lấy tiến độ học viên trong khóa học
 */
export const GET_STUDENT_PROGRESS = gql`
  query GetStudentProgress($courseId: UUID!) {
    getStudentProgress(courseId: $courseId) {
      userId
      fullName
      email
      enrolledAt
      progressPercent
      completedLessons
      totalLessons
    }
  }
`;
