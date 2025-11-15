import { api } from '../lib/api';

export const authAPI = {
  login: (email: string, password: string) =>
    api.post('/v1/auth/login', { email, password }),

  register: (fullName: string, email: string, password: string) =>
    api.post('/v1/auth/register', { fullName, email, password }),

  logout: () =>
    api.post('/v1/auth/logout'),
};

export const courseAPI = {
  getAll: () => api.get('/v1/courses'),

  getBySlug: (slug: string) => api.get(`/v1/courses/${slug}`),

  search: (query: string) => api.get(`/v1/courses/search`, { params: { q: query } }),
};

export const lessonAPI = {
  get: (id: string) => api.get(`/v1/lessons/${id}`),

  getProgress: (lessonId: string) => api.get(`/v1/progress/${lessonId}`),

  saveProgress: (lessonId: string, watched: number, total: number) =>
    api.post('/v1/progress', { lessonId, watched, total }),
};

export const userAPI = {
  getProfile: () => api.get('/v1/me'),

  getCourses: () => api.get('/v1/me/courses'),

  enrollCourse: (courseId: string) =>
    api.post('/v1/me/courses', { courseId }),
};
