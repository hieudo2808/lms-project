import { gql } from '@apollo/client';

export const GET_QUIZ_BY_LESSON = gql`
  query GetQuizByLesson($lessonId: UUID!) {
    getQuizByLesson(lessonId: $lessonId) {
      quizId
      title
      description
      duration
      passingScore
      isPublished
      questions {
        questionId
        content
        questionType
        score
        answers {
          answerId
          content
          isCorrect
        }
      }
    }
  }
`;
