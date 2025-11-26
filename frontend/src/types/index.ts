export type UserRole = 'STUDENT' | 'INSTRUCTOR' | 'ADMIN';

export interface User {
  id: string;
  email: string;
  fullName: string;
  avatarUrl?: string;
  bio?: string;
  role: UserRole;
}

export interface AuthRequest {
  email: string;
  password: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}

export type CourseLevel = 'beginner' | 'intermediate' | 'advanced';

export interface Course {
  id: string;
  title: string;
  slug: string;
  description: string;
  thumbnailUrl: string;
  instructorId: string;
  instructorName: string;
  level: CourseLevel;
  price: number;
  categoryId?: string;
  categoryName?: string;
  createdAt: string;
  updatedAt: string;
  isPublished: boolean;
  lessonsCount: number;
  totalDurationSeconds: number;
  rating: number;
  enrolledCount: number;
}

export interface Lesson {
  id: string;
  moduleId?: string;
  title: string;
  videoUrl: string;
  content?: string;
  durationSeconds: number;
  order: number;
}

export interface CourseDetail extends Course {
  lessons: Lesson[];
  fullDescription?: string;
  isEnrolled?: boolean;
}

export interface Progress {
  lessonId: string;
  watchedSeconds: number;
  totalSeconds: number;
  progressPercent: number;
  completed: boolean;
  lastWatchedAt: string;
}

export interface Review {
  id: string;
  courseId: string;
  userId: string;
  userName: string;
  userAvatarUrl?: string;
  rating: number;
  comment: string;
  createdAt: string;
}

export interface LessonComment {
  id: string;
  lessonId: string;
  userId: string;
  userName: string;
  userAvatarUrl?: string;
  content: string;
  createdAt: string;
  parentId?: string | null;
}

export interface QuizAnswer {
  id: string;
  questionId: string;
  text: string;
}

export interface QuizQuestion {
  id: string;
  quizId: string;
  text: string;
  answers: QuizAnswer[];
}

export interface Quiz {
  id: string;
  lessonId: string;
  title: string;
  questions: QuizQuestion[];
}

export interface LessonResource {
  id: string;            
  lessonId: string;
  resourceUrl: string;
  resourceType: string;  
}

export interface QuizAttemptResult {
  attemptId: string;
  quizId: string;
  lessonId: string;
  score: number;          
  correctCount: number;
  totalQuestions: number;
  createdAt: string;      
}

export interface QuizAttemptDetail extends QuizAttemptResult {
  answersReview: {
    questionId: string;
    questionText: string;
    answers: QuizAnswer[];
    correctAnswerId: string;
    selectedAnswerId?: string;
  }[];
}

export type PaymentStatus = 'SUCCESS' | 'PENDING' | 'FAILED' | 'CANCELED';

export interface PaymentHistoryItem {
  id: string;              
  userId: string;
  courseId: string;
  courseTitle: string;
  amount: number;
  paymentMethod: string;   
  transactionId: string;
  paymentStatus: PaymentStatus;
  createdAt: string;
}
