import { gql } from '@apollo/client';

export const CREATE_QUIZ = gql`
  mutation CreateQuiz($input: CreateQuizInput!) {
    createQuiz(input: $input) {
      quizId
      title
    }
  }
`;

export const CREATE_QUESTION = gql`
  mutation CreateQuestion($input: CreateQuestionInput!) {
    createQuestion(input: $input) {
      questionId
    }
  }
`;

export const CREATE_ANSWER = gql`
  mutation CreateAnswer($input: CreateAnswerInput!) {
    createAnswer(input: $input) {
      answerId
    }
  }
`;

export const UPDATE_QUESTION = gql`
  mutation UpdateQuestion($questionId: UUID!, $input: UpdateQuestionInput!) {
    updateQuestion(questionId: $questionId, input: $input) {
      questionId
    }
  }
`;

export const PUBLISH_QUIZ = gql`
  mutation PublishQuiz($quizId: UUID!) {
    publishQuiz(quizId: $quizId)
  }
`;

export const START_QUIZ_ATTEMPT = gql`
  mutation StartQuizAttempt($quizId: UUID!) {
    startQuizAttempt(quizId: $quizId) {
      attemptId
      attemptNumber
      startTime
      status
      quiz {
        quizId
        timeLimit
      }
    }
  }
`;

export const SUBMIT_QUIZ_ANSWER = gql`
  mutation SubmitQuizAnswer($attemptId: UUID!, $input: SubmitQuizAnswerInput!) {
    submitQuizAnswer(attemptId: $attemptId, input: $input) {
      answerId
      selectedAnswerId
      isCorrect
      pointsAwarded
    }
  }
`;

export const FINISH_QUIZ_ATTEMPT = gql`
  mutation FinishQuizAttempt($attemptId: UUID!) {
    finishQuizAttempt(attemptId: $attemptId) {
      attemptId
      totalScore
      maxScore
      percentage
      status
      passed
      endTime
    }
  }
`;