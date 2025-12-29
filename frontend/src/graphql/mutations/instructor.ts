import { gql } from '@apollo/client';

export const CREATE_COURSE_MUTATION = gql`
  mutation CreateCourse($input: CreateCourseInput!) {
    createCourse(input: $input) {
      courseId
      title
      slug
      price
      level
      isPublished
    }
  }
`;

export const UPDATE_COURSE_MUTATION = gql`
  mutation UpdateCourse($courseId: UUID!, $input: UpdateCourseInput!) {
    updateCourse(courseId: $courseId, input: $input) {
      courseId
      title
      slug
      description
      price
      level
      thumbnailUrl
      isPublished
    }
  }
`;

export const DELETE_COURSE_MUTATION = gql`
  mutation DeleteCourse($courseId: UUID!) {
    deleteCourse(courseId: $courseId)
  }
`;

export const PUBLISH_COURSE_MUTATION = gql`
  mutation PublishCourse($courseId: UUID!) {
    publishCourse(courseId: $courseId) {
      courseId
      isPublished
    }
  }
`;

export const UNPUBLISH_COURSE_MUTATION = gql`
  mutation UnpublishCourse($courseId: UUID!) {
    unpublishCourse(courseId: $courseId) {
      courseId
      isPublished
    }
  }
`;

export const CREATE_MODULE_MUTATION = gql`
  mutation CreateModule($input: CreateModuleInput!) {
    createModule(input: $input) {
      moduleId
      title
      order
    }
  }
`;

export const UPDATE_MODULE_MUTATION = gql`
  mutation UpdateModule($moduleId: UUID!, $input: UpdateModuleInput!) {
    updateModule(moduleId: $moduleId, input: $input) {
      moduleId
      title
      order
    }
  }
`;

export const DELETE_MODULE_MUTATION = gql`
  mutation DeleteModule($moduleId: UUID!) {
    deleteModule(moduleId: $moduleId)
  }
`;

export const REORDER_MODULES_MUTATION = gql`
  mutation ReorderModules($courseId: UUID!, $moduleIds: [UUID!]!) {
    reorderModules(courseId: $courseId, moduleIds: $moduleIds) {
      moduleId
      order
    }
  }
`;

export const CREATE_LESSON_MUTATION = gql`
  mutation CreateLesson($input: CreateLessonInput!) {
    createLesson(input: $input) {
      lessonId
      title
      order
      videoUrl
    }
  }
`;

export const UPDATE_LESSON_MUTATION = gql`
  mutation UpdateLesson($lessonId: UUID!, $input: UpdateLessonInput!) {
    updateLesson(lessonId: $lessonId, input: $input) {
      lessonId
      title
      content
      videoUrl
      durationSeconds
    }
  }
`;

export const DELETE_LESSON_MUTATION = gql`
  mutation DeleteLesson($lessonId: UUID!) {
    deleteLesson(lessonId: $lessonId)
  }
`;

export const REORDER_LESSONS_MUTATION = gql`
  mutation ReorderLessons($moduleId: UUID!, $lessonIds: [UUID!]!) {
    reorderLessons(moduleId: $moduleId, lessonIds: $lessonIds) {
      lessonId
      order
    }
  }
`;

export const UPDATE_QUIZ_MUTATION = gql`
  mutation UpdateQuiz($quizId: UUID!, $input: UpdateQuizInput!) {
    updateQuiz(quizId: $quizId, input: $input) {
      quizId
      title
      description
      timeLimit
      passingScore
      maxAttempts
      isPublished
    }
  }
`;

export const DELETE_QUESTION_MUTATION = gql`
  mutation DeleteQuestion($questionId: UUID!) {
    deleteQuestion(questionId: $questionId)
  }
`;

export const CREATE_QUESTION_MUTATION = gql`
  mutation CreateQuestion($input: CreateQuestionInput!) {
    createQuestion(input: $input) {
      questionId
      questionText
      questionType
    }
  }
`;

export const CREATE_ANSWER_MUTATION = gql`
  mutation CreateAnswer($input: CreateAnswerInput!) {
    createAnswer(input: $input) {
      answerId
      answerText
      isCorrect
    }
  }
`;

export const UPDATE_QUESTION_MUTATION = gql`
  mutation UpdateQuestion($questionId: UUID!, $input: UpdateQuestionInput!) {
    updateQuestion(questionId: $questionId, input: $input) {
      questionId
      questionText
      questionType
      points
      explanation
      answers {
        answerId
        answerText
        isCorrect
      }
    }
  }
`;

export const UPDATE_ANSWER_MUTATION = gql`
  mutation UpdateAnswer($answerId: UUID!, $input: UpdateAnswerInput!) {
    updateAnswer(answerId: $answerId, input: $input) {
      answerId
      answerText
      isCorrect
    }
  }
`;

export const DELETE_QUIZ_MUTATION = gql`
  mutation DeleteQuiz($quizId: UUID!) {
    deleteQuiz(quizId: $quizId)
  }
`;