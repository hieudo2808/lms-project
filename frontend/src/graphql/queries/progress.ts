import { gql } from '@apollo/client';

export const GET_MY_PROGRESS = gql`
  query GetMyProgress($courseId: UUID) {
    myProgress(courseId: $courseId) {
      progressId
      lessonId
      lessonTitle
      watchedSeconds
      progressPercent
      lastWatchedAt
    }
  }
`;

export const GET_LESSON_PROGRESS = gql`
  query GetLessonProgress($lessonId: UUID!) {
    getLessonProgress(lessonId: $lessonId) {
      progressId
      lessonId
      lessonTitle
      watchedSeconds
      progressPercent
      lastWatchedAt
    }
  }
`;
