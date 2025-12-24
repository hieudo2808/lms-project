import { gql } from '@apollo/client';

export const ENROLL_COURSE_MUTATION = gql`
    mutation EnrollCourse($courseId: UUID!) {
        enrollCourse(courseId: $courseId) {
            enrollmentId
            enrolledAt
        }
    }
`;

export const UPDATE_PROGRESS_MUTATION = gql`
    mutation UpdateProgress($lessonId: UUID!, $input: UpdateProgressInput!) {
        updateProgress(lessonId: $lessonId, input: $input) {
            progressId
            watchedSeconds
            progressPercent
        }
    }
`;
