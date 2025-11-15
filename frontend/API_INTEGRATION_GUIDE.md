# API Integration Guide

Hướng dẫn chi tiết để tích hợp Frontend với Backend API.

## 📋 Bước 1: Cấu hình URL API

### File `.env`
```env
VITE_API_URL=http://localhost:8080/api
```

Nếu backend chạy trên port khác:
```env
VITE_API_URL=http://your-backend-url/api
```

## 🔑 Step 2: Tích hợp Authentication

### 2.1 Update `src/services/api.ts`

Thay thế mock auth bằng real API:

```typescript
export const authAPI = {
  login: (email: string, password: string) =>
    apiFetch('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    }),
  // Trả về: { token: string, user: User }

  register: (fullName: string, email: string, password: string) =>
    apiFetch('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ fullName, email, password }),
    }),
  // Trả về: { token: string, user: User }
};
```

### 2.2 Update `src/pages/LoginPage.tsx`

```typescript
const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  if (!validateForm()) return;

  setIsLoading(true);
  try {
    const response = await authAPI.login(email, password);
    login(response.user, response.token);
    navigate('/dashboard/my-courses');
  } catch (error) {
    setErrors({ form: error.message });
  } finally {
    setIsLoading(false);
  }
};
```

### 2.3 Update `src/pages/RegisterPage.tsx`

```typescript
const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  if (!validateForm()) return;

  setIsLoading(true);
  try {
    const response = await authAPI.register(
      formData.fullName,
      formData.email,
      formData.password
    );
    login(response.user, response.token);
    navigate('/dashboard/my-courses');
  } catch (error) {
    setErrors({ form: error.message });
  } finally {
    setIsLoading(false);
  }
};
```

## 📚 Step 3: Tích hợp Course APIs

### 3.1 Update `src/pages/HomePage.tsx`

```typescript
import { courseAPI } from '../services/api';

export const HomePage = () => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const data = await courseAPI.getAll();
        setCourses(data);
      } catch (error) {
        console.error('Error fetching courses:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCourses();
  }, []);

  // Search functionality
  const handleSearch = async (term: string) => {
    if (!term) {
      const data = await courseAPI.getAll();
      setCourses(data);
      return;
    }
    
    try {
      const data = await courseAPI.search(term);
      setCourses(data);
    } catch (error) {
      console.error('Error searching courses:', error);
    }
  };
};
```

### 3.2 Update `src/pages/CourseDetailPage.tsx`

```typescript
import { courseAPI, userAPI } from '../services/api';

export const CourseDetailPage = () => {
  const [course, setCourse] = useState<CourseDetail | null>(null);
  const [isEnrolled, setIsEnrolled] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    const fetchCourse = async () => {
      try {
        const data = await courseAPI.getBySlug(slug!);
        setCourse(data);
        
        // Check if user is enrolled
        if (user) {
          const userCourses = await userAPI.getCourses();
          setIsEnrolled(userCourses.some(c => c.id === data.id));
        }
      } catch (error) {
        console.error('Error fetching course:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCourse();
  }, [slug, user]);

  const handleEnroll = async () => {
    try {
      await userAPI.enrollCourse(course!.id);
      setIsEnrolled(true);
    } catch (error) {
      console.error('Error enrolling in course:', error);
    }
  };
};
```

### 3.3 Update `src/pages/MyCoursesPage.tsx`

```typescript
import { userAPI } from '../services/api';

export const MyCoursesPage = () => {
  const [courses, setCourses] = useState<Course[]>([]);
  const { user, isLoading: authLoading } = useAuth();

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }

    const fetchCourses = async () => {
      try {
        const data = await userAPI.getCourses();
        setCourses(data);
      } catch (error) {
        console.error('Error fetching courses:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCourses();
  }, [user]);
};
```

## 🎬 Step 4: Tích hợp Progress APIs

### 4.1 Update `src/components/VideoPlayer.tsx`

```typescript
import { lessonAPI } from '../services/api';

export const VideoPlayer = ({ 
  videoUrl, 
  title, 
  duration, 
  lessonId,
  courseId,
}: VideoPlayerProps) => {
  const handleProgressUpdate = async (newProgress: Progress) => {
    try {
      await lessonAPI.saveProgress(
        lessonId,
        newProgress.watchedDuration,
        newProgress.totalDuration
      );
    } catch (error) {
      console.error('Error saving progress:', error);
    }
  };

  // ...
};
```

### 4.2 Update `src/pages/LessonPage.tsx`

```typescript
import { lessonAPI } from '../services/api';

export const LessonPage = () => {
  useEffect(() => {
    const fetchProgress = async () => {
      try {
        const progress = await lessonAPI.getProgress(id!);
        setProgress(progress);
        
        // Resume from last watched position
        if (videoRef.current && progress.watchedDuration > 0) {
          videoRef.current.currentTime = progress.watchedDuration;
        }
      } catch (error) {
        console.error('Error fetching progress:', error);
      }
    };

    fetchProgress();
  }, [id]);
};
```

## 🛡️ Step 5: Error Handling

### 5.1 Tạo Error Boundary

```typescript
// src/components/ErrorBoundary.tsx
import React from 'react';

export class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: Error) {
    console.error('Error caught:', error);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="text-center py-12">
          <h1>Có lỗi xảy ra</h1>
          <button onClick={() => this.setState({ hasError: false })}>
            Thử lại
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
```

### 5.2 Wrap App với ErrorBoundary

```typescript
// src/main.tsx
<ErrorBoundary>
  <AuthProvider>
    <App />
  </AuthProvider>
</ErrorBoundary>
```

## 🔔 Step 6: Add Notifications (Optional)

### 6.1 Tạo Toast Context

```typescript
// src/contexts/ToastContext.tsx
interface Toast {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info';
}

// Implement toast provider...
```

### 6.2 Sử dụng trong API calls

```typescript
const { addToast } = useToast();

try {
  await authAPI.login(email, password);
  addToast('Đăng nhập thành công!', 'success');
} catch (error) {
  addToast(error.message, 'error');
}
```

## 🔒 Step 7: Protected Routes

### 7.1 Tạo ProtectedRoute component

```typescript
// src/components/ProtectedRoute.tsx
interface ProtectedRouteProps {
  element: React.ReactElement;
}

export const ProtectedRoute = ({ element }: ProtectedRouteProps) => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return isAuthenticated ? element : <Navigate to="/login" />;
};
```

### 7.2 Update routing

```typescript
// src/App.tsx
<Route 
  path="/dashboard/my-courses" 
  element={<ProtectedRoute element={<MyCoursesPage />} />}
/>
<Route 
  path="/courses/:slug/lesson/:id" 
  element={<ProtectedRoute element={<LessonPage />} />}
/>
```

## ✅ Testing Checklist

- [ ] Login/Register works
- [ ] Tokens saved in localStorage
- [ ] API calls include Authorization header
- [ ] Errors handled properly
- [ ] Navbar updates after login
- [ ] Protected routes redirect to login if not authenticated
- [ ] Course list loads from API
- [ ] Course detail loads from API
- [ ] Can enroll in course
- [ ] Progress is saved
- [ ] Dashboard shows enrolled courses
- [ ] Logout clears token and redirects

## 🐛 Common Issues

### CORS Error
**Solution**: Configure CORS in backend
```java
@Configuration
public class CorsConfig {
    @Bean
    public WebMvcConfigurer corsConfigurer() {
        return new WebMvcConfigurer() {
            @Override
            public void addCorsMappings(CorsRegistry registry) {
                registry.addMapping("/api/**")
                    .allowedOrigins("http://localhost:5173")
                    .allowedMethods("GET", "POST", "PUT", "DELETE")
                    .allowCredentials(true);
            }
        };
    }
}
```

### 401 Unauthorized on requests
**Solution**: Check token is being sent correctly
```typescript
// src/services/api.ts - verify Authorization header
const token = getAuthToken();
if (token) {
  headers['Authorization'] = `Bearer ${token}`;
}
```

### Empty user profile
**Solution**: Make sure /me endpoint returns full user data
```typescript
// Backend should return:
{
  "id": "user-id",
  "email": "user@example.com",
  "fullName": "User Name",
  "avatar": "url..."
}
```

## 📖 Resources

- [React Router Documentation](https://reactrouter.com/)
- [Fetch API MDN](https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)

---

**Last Updated**: November 15, 2025
