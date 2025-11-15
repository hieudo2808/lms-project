import { useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { CourseList } from '../components/CourseList';
import { Layout } from '../components/Layout';
import { courseAPI } from '../services/api';
import type { Course } from '../types';

export const HomePage = () => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterLevel, setFilterLevel] = useState<string>('');
  const [searchParams] = useSearchParams();
  const coursesRef = useRef<HTMLDivElement>(null);
  const statsRef = useRef<HTMLDivElement>(null);

  const scrollToCourses = () => {
    coursesRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const scrollToStats = () => {
    statsRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Mock data - fallback khi API không available
  const mockCourses: Course[] = [
    {
      id: '1',
      title: 'React + TypeScript từ Zero đến Hero',
      slug: 'react-typescript-zero-hero',
      description: 'Học React và TypeScript từ cơ bản đến nâng cao',
      thumbnail: 'https://via.placeholder.com/400x300?text=React+Course',
      instructor: 'Nguyễn Văn A',
      level: 'beginner',
      duration: 450,
      lessonsCount: 25,
      rating: 4.8,
      enrolledCount: 2500,
    },
    {
      id: '2',
      title: 'Node.js Express API Development',
      slug: 'nodejs-express-api',
      description: 'Xây dựng API RESTful với Node.js và Express',
      thumbnail: 'https://via.placeholder.com/400x300?text=Node.js+Course',
      instructor: 'Trần Thị B',
      level: 'intermediate',
      duration: 380,
      lessonsCount: 20,
      rating: 4.6,
      enrolledCount: 1800,
    },
    {
      id: '3',
      title: 'Python cho Data Science',
      slug: 'python-data-science',
      description: 'Khám phá Data Science với Python',
      thumbnail: 'https://via.placeholder.com/400x300?text=Python+Course',
      instructor: 'Lê Hoàng C',
      level: 'intermediate',
      duration: 520,
      lessonsCount: 28,
      rating: 4.7,
      enrolledCount: 3200,
    },
    {
      id: '4',
      title: 'Docker & Kubernetes Mastery',
      slug: 'docker-kubernetes-mastery',
      description: 'Nắm vững Docker và Kubernetes cho DevOps',
      thumbnail: 'https://via.placeholder.com/400x300?text=Docker+Course',
      instructor: 'Phạm Minh D',
      level: 'advanced',
      duration: 600,
      lessonsCount: 32,
      rating: 4.9,
      enrolledCount: 1200,
    },
  ];

  // Initialize filter level from URL params
  useEffect(() => {
    const levelFromParams = searchParams.get('level');
    if (levelFromParams) {
      setFilterLevel(levelFromParams);
      // Scroll to courses section after setting filter
      setTimeout(() => {
        coursesRef.current?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    }
  }, [searchParams]);

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const response = await courseAPI.getAll();
        setCourses(response.data || mockCourses);
      } catch (err) {
        console.error('Failed to fetch courses:', err);
        setCourses(mockCourses);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCourses();
  }, []);

  const filteredCourses = courses.filter((course) => {
    const matchesSearch = course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         course.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesLevel = !filterLevel || course.level === filterLevel;
    return matchesSearch && matchesLevel;
  });

  return (
    <Layout>
      {/* Hero Section - Coursera Style */}
      <section className="bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white py-20">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Left Content */}
            <div>
              <h1 className="text-5xl lg:text-6xl font-bold mb-6 leading-tight">
                Học từ những chuyên gia tốt nhất
              </h1>
              <p className="text-xl text-gray-200 mb-8 leading-relaxed">
                Nâng cao kỹ năng của bạn với các khóa học chất lượng cao từ những giáo viên hàng đầu trong ngành.
              </p>
              <div className="flex gap-4">
                <button 
                  onClick={scrollToCourses}
                  className="px-8 py-3 bg-white text-purple-600 font-bold rounded-lg hover:shadow-lg hover:scale-105 transition-all"
                >
                  Bắt đầu học
                </button>
                <button 
                  onClick={scrollToStats}
                  className="px-8 py-3 border-2 border-white text-white font-bold rounded-lg hover:bg-white hover:text-purple-600 transition-all"
                >
                  Tìm hiểu thêm
                </button>
              </div>
            </div>
            
            {/* Right Illustration */}
            <div className="flex justify-center">
              <div className="w-64 h-64 bg-gradient-to-br from-purple-400 to-blue-500 rounded-3xl opacity-80 animate-pulse"></div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section ref={statsRef} className="bg-white py-12 border-b">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-3 gap-8 text-center">
            <div>
              <div className="text-4xl font-bold text-blue-600 mb-2">5000+</div>
              <p className="text-gray-600 font-medium">Khóa học</p>
            </div>
            <div>
              <div className="text-4xl font-bold text-purple-600 mb-2">100k+</div>
              <p className="text-gray-600 font-medium">Học viên</p>
            </div>
            <div>
              <div className="text-4xl font-bold text-green-600 mb-2">500+</div>
              <p className="text-gray-600 font-medium">Giáo viên</p>
            </div>
          </div>
        </div>
      </section>

      {/* Search and Filter */}
      <section className="bg-gray-50 py-8 sticky top-16 z-40 shadow-sm">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <input
                type="text"
                placeholder="🔍 Tìm kiếm khóa học..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm"
              />
            </div>
            
            <div>
              <select
                value={filterLevel}
                onChange={(e) => setFilterLevel(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm bg-white"
              >
                <option value="">📚 Tất cả cấp độ</option>
                <option value="beginner">🌱 Cơ bản</option>
                <option value="intermediate">📈 Trung bình</option>
                <option value="advanced">🚀 Nâng cao</option>
              </select>
            </div>

            <div className="flex items-center justify-center">
              <span className="text-sm font-semibold text-gray-700 bg-white px-4 py-3 rounded-lg shadow-sm">
                ✨ Tìm thấy <span className="text-blue-600">{filteredCourses.length}</span> khóa học
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Courses Grid */}
      <section ref={coursesRef} className="max-w-7xl mx-auto px-4 py-16">
        <h2 className="text-3xl font-bold text-gray-900 mb-2">Khóa học phổ biến</h2>
        <p className="text-gray-600 mb-8">Các khóa học được yêu thích nhất bởi học viên</p>
        <CourseList courses={filteredCourses} isLoading={isLoading} />
      </section>
    </Layout>
  );
};
