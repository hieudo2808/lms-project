import { gql } from '@apollo/client';

export const ENROLL_COURSE_MUTATION = gql`
  mutation EnrollCourse($courseId: UUID!) {
    enrollCourse(courseId: $courseId) {
      enrollmentId
      enrolledAt
    }
  }
`;