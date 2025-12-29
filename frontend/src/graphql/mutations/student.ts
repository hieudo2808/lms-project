import { gql } from '@apollo/client';

export const REMOVE_STUDENT_FROM_COURSE = gql`
    mutation RemoveStudentFromCourse($courseId: UUID!, $userId: UUID!) {
        removeStudentFromCourse(courseId: $courseId, userId: $userId)
    }
`;
