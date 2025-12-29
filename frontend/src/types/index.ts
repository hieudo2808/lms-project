export interface User {
  userId: string;      
  fullName: string;
  email: string;
  avatarUrl?: string | null;
  bio?: string | null;
  roleName: string; 
  createdAt?: string;
  isActive: boolean;
}

export interface Instructor {
  userId: string;
  fullName: string;
  email?: string;
  avatarUrl?: string | null;
  bio?: string | null;
}

export interface AuthResponse {
  token: string;
  refreshToken: string; 
  user: User;
}

export interface LoginInput {
  email: string;
  password: string;
}

export interface RegisterInput {
  fullName: string;
  email: string;
  password: string;
}

export interface Lesson {
  lessonId: string;         
  title: string;
  videoUrl?: string | null;
  content?: string | null;
  durationSeconds?: number | null;
  order: number;
  userProgress?: number | null; 
}

export interface Module {
  moduleId: string;
  title: string;
  order: number;
  lessons: Lesson[];
}

export interface Course {
  courseId: string;         
  title: string;
  slug: string;
  description?: string | null;
  thumbnailUrl?: string | null;
  level?: string | null;
  price?: number | null;   
  categoryName?: string | null;
  
  rating?: number;
  reviewCount?: number;
  
  instructor?: Instructor | null; 
  
  createdAt?: string;
  updatedAt?: string;
  isPublished: boolean;
  
  modules?: Module[]; 
  
  totalLessons?: number | null;
  totalDuration?: number | null;
}

export interface Enrollment {
  enrollmentId: string;
  course: Course;
  enrolledAt: string;
  progressPercent: number;
}

export interface Progress {
  progressId: string;
  lessonId: string;
  lessonTitle?: string;
  watchedSeconds: number;
  progressPercent: number;
  lastWatchedAt?: string;
}

export interface Review {
  id: string;
  courseId: string;
  userId: string;
  userName: string;
  rating: number;
  comment: string;
  createdAt: string;
}

export interface Quiz {
  id: string;
  title: string;
}

export interface UpdateProfileInput {
  fullName?: string;
  bio?: string;
  avatarUrl?: string;
}
export interface UpdateProgressInput {
  watchedSeconds?: number;
  progressPercent?: number;
}

export type PaymentStatus = 'SUCCESS' | 'PENDING' | 'FAILED';