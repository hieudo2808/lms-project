import { gql } from '@apollo/client';

export const CREATE_QUIZ = gql`
  mutation CreateQuiz($input: CreateQuizRequest!) {
    createQuiz(input: $input) {
      quizId
      title
    }
  }
`;

export const CREATE_QUESTION = gql`
  mutation CreateQuestion($input: CreateQuestionRequest!) {
    createQuestion(input: $input) {
      questionId
    }
  }
`;

export const CREATE_ANSWER = gql`
  mutation CreateAnswer($input: CreateAnswerRequest!) {
    createAnswer(input: $input) {
      answerId
    }
  }
`;

export const PUBLISH_QUIZ = gql`
  mutation PublishQuiz($quizId: UUID!) {
    publishQuiz(quizId: $quizId)
  }
`;