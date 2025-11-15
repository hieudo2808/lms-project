export interface User {
  id: string;
  email: string;
  fullName: string;
  avatar?: string;
}

export interface Course {
  id: string;
  title: string;
  slug: string;
  description: string;
  thumbnail: string;
  instructor: string;
  level: 'beginner' | 'intermediate' | 'advanced';
  duration: number; // in minutes
  lessonsCount: number;
  rating: number;
  enrolledCount: number;
}

export interface Lesson {
  id: string;
  title: string;
  duration: number; // in minutes
  videoUrl: string;
  description?: string;
  order: number;
}

export interface CourseDetail extends Course {
  lessons: Lesson[];
  fullDescription?: string;
}

export interface Progress {
  lessonId: string;
  courseId: string;
  completed: boolean;
  watchedDuration: number; // in seconds
  totalDuration: number; // in seconds
  lastWatched: string; // ISO date
}

export interface AuthRequest {
  email: string;
  password: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}
