import { useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useQuery } from '@apollo/client';
import { CourseList } from '../components/CourseList';
import { Layout } from '../components/Layout';
import { GET_ALL_COURSES } from '../graphql/queries/course';
import type { Course } from '../types';

export const HomePage = () => {
  // Gọi API Backend 
  const { data, loading, error } = useQuery(GET_ALL_COURSES);
  
  const [searchTerm, setSearchTerm] = useState('');
  const [filterLevel, setFilterLevel] = useState<string>('');
  const [searchParams] = useSearchParams();
  const coursesRef = useRef<HTMLDivElement>(null);
  const statsRef = useRef<HTMLDivElement>(null);

  // Map dữ liệu từ Backend sang Frontend 
  const courses: Course[] = data?.getAllCourses?.map((c: any) => ({
    id: c.courseId,
    courseId: c.courseId,
    
    title: c.title,
    slug: c.slug,
    description: c.description,
    thumbnailUrl: c.thumbnailUrl || 'https://via.placeholder.com/400x300',
    
    instructor: c.instructor ? {
        userId: c.instructor.userId,
        fullName: c.instructor.fullName,
        avatarUrl: c.instructor.avatarUrl || null
    } : null,

    level: c.level,
    price: c.price,
    totalDuration: c.totalDuration || 0, 
    totalLessons: c.totalLessons || 0,   
    isPublished: true, 
    rating: 5.0,
    enrolledCount: 0
  })) || [];

  const scrollToCourses = () => {
    coursesRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const scrollToStats = () => {
    statsRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    const levelFromParams = searchParams.get('level');
    if (levelFromParams) {
      setFilterLevel(levelFromParams);
      setTimeout(() => {
        coursesRef.current?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    }
  }, [searchParams]);

  const filteredCourses = courses.filter((course) => {
    const matchesSearch =
      course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      course.description?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesLevel = !filterLevel || course.level === filterLevel;

    return matchesSearch && matchesLevel;
  });

  return (
    <Layout>
      <section className="bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white py-20">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h1 className="text-5xl lg:text-6xl font-bold mb-6 leading-tight">
                Học từ những chuyên gia tốt nhất
              </h1>
              <p className="text-xl text-gray-200 mb-8 leading-relaxed">
                Nâng cao kỹ năng của bạn với các khóa học chất lượng cao từ
                những giáo viên hàng đầu trong ngành.
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
            <div className="flex justify-center">
              <div className="w-64 h-64 bg-gradient-to-br from-purple-400 to-blue-500 rounded-3xl opacity-80 animate-pulse" />
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section ref={statsRef} className="bg-white py-12 border-b">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-3 gap-8 text-center">
            <div>
              <div className="text-4xl font-bold text-blue-600 mb-2">5+</div>
              <p className="text-gray-600 font-medium">Khóa học</p>
            </div>
            <div>
              <div className="text-4xl font-bold text-purple-600 mb-2">100+</div>
              <p className="text-gray-600 font-medium">Học viên</p>
            </div>
            <div>
              <div className="text-4xl font-bold text-green-600 mb-2">10+</div>
              <p className="text-gray-600 font-medium">Giáo viên</p>
            </div>
          </div>
        </div>
      </section>

      {/* Filter Section */}
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
                <option value="Beginner">🌱 Cơ bản</option>
                <option value="Intermediate">📈 Trung bình</option>
                <option value="Advanced">🚀 Nâng cao</option>
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

      {/* Course List */}
      <section ref={coursesRef} className="max-w-7xl mx-auto px-4 py-16">
        <h2 className="text-3xl font-bold text-gray-900 mb-2">Khóa học phổ biến</h2>
        {error ? (
           <div className="text-red-500 text-center border p-4 rounded bg-red-50">
             <p className="font-bold">Không thể tải khóa học</p>
             <p className="text-sm">{error.message}</p>
           </div>
        ) : (
           <CourseList courses={filteredCourses} isLoading={loading} />
        )}
      </section>
    </Layout>
  );
};