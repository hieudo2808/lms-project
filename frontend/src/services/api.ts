import { api } from '../lib/api';

// Auth
export const authAPI = {
  login: (email: string, password: string) =>
    api.post('/v1/auth/login', { email, password }),

  register: (fullName: string, email: string, password: string) =>
    api.post('/v1/auth/register', { fullName, email, password }),

  logout: () => api.post('/v1/auth/logout'),
};

// Courses
export const courseAPI = {
  getAll: () => api.get('/v1/courses'),
  getBySlug: (slug: string) => api.get(`/v1/courses/${slug}`),
  search: (query: string) =>
    api.get('/v1/courses/search', { params: { q: query } }),
};

// Lesson / progress / resources
export const lessonAPI = {
  get: (id: string) => api.get(`/v1/lessons/${id}`),

  getProgress: (lessonId: string) =>
    api.get(`/v1/progress/${lessonId}`),

  saveProgress: (
    lessonId: string,
    watchedSeconds: number,
    totalSeconds: number
  ) =>
    api.post('/v1/progress', {
      lessonId,
      watchedSeconds,
      totalSeconds,
    }),

  getResources: (lessonId: string) =>
    api.get(`/v1/lessons/${lessonId}/resources`),
};

// User
export const userAPI = {
  getProfile: () => api.get('/v1/me'),
  getCourses: () => api.get('/v1/me/courses'),
  enrollCourse: (courseId: string) =>
    api.post('/v1/me/courses', { courseId }),
};

// Course reviews
export const reviewAPI = {
  getCourseReviews: (courseId: string) =>
    api.get(`/v1/courses/${courseId}/reviews`),

  createReview: (courseId: string, rating: number, comment: string) =>
    api.post(`/v1/courses/${courseId}/reviews`, { rating, comment }),
};

// Lesson comments
export const commentAPI = {
  getLessonComments: (lessonId: string) =>
    api.get(`/v1/lessons/${lessonId}/comments`),

  createComment: (lessonId: string, content: string, parentId?: string) =>
    api.post('/v1/lessons/${lessonId}/comments', {
      content,
      parentId: parentId || null,
    }),
};

// Quiz
export const quizAPI = {
  getLessonQuiz: (lessonId: string) =>
    api.get(`/v1/lessons/${lessonId}/quiz`),

  submitQuiz: (
    lessonId: string,
    answers: { questionId: string; answerId: string }[]
  ) =>
    api.post(`/v1/lessons/${lessonId}/quiz/submit`, { answers }),

  getLessonQuizAttempts: (lessonId: string) =>
    api.get(`/v1/lessons/${lessonId}/quiz/attempts`),

  getLessonQuizAttemptDetail: (lessonId: string, attemptId: string) =>
    api.get(`/v1/lessons/${lessonId}/quiz/attempts/${attemptId}`),
};

// Payments
export const paymentAPI = {
  getMyPayments: () => api.get('/v1/me/payments'),
  createCheckout: (courseId: string) =>
    api.post(`/v1/courses/${courseId}/checkout`),
};
