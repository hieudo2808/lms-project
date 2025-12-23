import { gql } from '@apollo/client';

export const GET_COMMENTS_BY_LESSON = gql`
  query GetCommentsByLesson($lessonId: UUID!) {
    getCommentsByLesson(lessonId: $lessonId) {
      commentId
      content
      createdAt
      user {
        fullName
        avatarUrl
      }
      replies {
        commentId
        content
        createdAt
        user {
          fullName
          avatarUrl
        }
      }
    }
  }
`;
