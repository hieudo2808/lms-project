import { gql } from '@apollo/client';

export const INSTRUCTOR_DASHBOARD_QUERY = gql`
  query InstructorDashboard {
    me {
      userId
      fullName
      avatarUrl
      roleName
    }

    getMyCourses {
      courseId
      title
      slug
      price
      thumbnailUrl
      isPublished
      level
      totalLessons
    }
  }
`;