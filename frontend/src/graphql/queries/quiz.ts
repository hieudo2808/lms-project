import { gql } from '@apollo/client';

export const GET_QUIZ_BY_LESSON = gql`
  query GetQuizzesByLesson($lessonId: UUID!) {
    # Tên query chuẩn trong Schema là getQuizzesByLesson
    getQuizzesByLesson(lessonId: $lessonId) {
      quizId
      title
      description
      timeLimit     
      passingScore  
      isPublished   
      questions {
        questionId
        questionText 
        questionType 
        points      
        answers {
          answerId
          answerText 
          isCorrect 
        }
      }
    }
  }
`;

export const GET_QUIZ_BY_ID = gql`
  query GetQuizById($quizId: UUID!) {
    getQuizById(quizId: $quizId) {
      quizId
      title
      description
      timeLimit
      passingScore
      maxAttempts
      isPublished
      questions {
        questionId
        questionText
        questionType
        points
        answers {
          answerId
          answerText
          isCorrect
        }
      }
    }
  }
`;

export const GET_MY_QUIZ_ATTEMPTS = gql`
  query GetMyQuizAttempts($quizId: UUID!) {
    getMyQuizAttempts(quizId: $quizId) {
      attemptId
      attemptNumber
      startTime
      endTime
      totalScore
      maxScore
      percentage
      status
      passed
      userAnswers {
        answerId
        question {
          questionId
          questionText
        }
        selectedAnswerId
        isCorrect
        pointsAwarded
      }
    }
  }
`;