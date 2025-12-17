import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery, useMutation } from '@apollo/client';
import { Layout } from '../components/Layout';
import type { CourseDetail } from '../types';
import { CourseHero } from '../components/course/CourseHero';
import { CourseInfo } from '../components/course/CourseInfo';
import { CourseLessonList } from '../components/course/CourseLessonList';
import { CourseSidebar } from '../components/course/CourseSidebar';
import { CourseReviews } from '../components/course/CourseReviews';
import { useAuthStore } from '../lib/store';
import { GET_COURSE_BY_SLUG } from '../graphql/queries/course';
import { ENROLL_COURSE_MUTATION } from '../graphql/mutations/enrollment';

export const CourseDetailPage = () => {
  const { slug } = useParams<{ slug: string }>();
  const { auth } = useAuthStore();

  //Fetch dữ liệu thật
  const { data, loading, error } = useQuery(GET_COURSE_BY_SLUG, {
    variables: { slug },
    skip: !slug
  });

  //Mutation đăng ký
  const [enrollMutation, { loading: isEnrollLoading }] = useMutation(ENROLL_COURSE_MUTATION);
  const [enrollError, setEnrollError] = useState<string | null>(null);
  const [isEnrolled, setIsEnrolled] = useState(false);

  //Map dữ liệu từ Backend
  const course: CourseDetail | null = data?.getCourseBySlug ? {
    id: data.getCourseBySlug.courseId,
    title: data.getCourseBySlug.title,
    slug: data.getCourseBySlug.slug,
    description: data.getCourseBySlug.description,
    fullDescription: data.getCourseBySlug.description,
    thumbnailUrl: data.getCourseBySlug.thumbnailUrl || 'https://via.placeholder.com/800x400',
    instructorId: data.getCourseBySlug.instructor?.userId,
    instructorName: data.getCourseBySlug.instructor?.fullName,
    level: data.getCourseBySlug.level,
    price: data.getCourseBySlug.price,
    lessonsCount: data.getCourseBySlug.totalLessons || 0,
    totalDurationSeconds: data.getCourseBySlug.totalDuration || 0,
    rating: 5.0,
    enrolledCount: 0,
    isPublished: data.getCourseBySlug.isPublished,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    // Flatten Modules -> Lessons cho giao diện hiện tại
    lessons: data.getCourseBySlug.modules?.flatMap((m: any) => 
      m.lessons.map((l: any) => ({
        id: l.lessonId,
        title: l.title,
        videoUrl: l.videoUrl, 
        content: l.content,
        durationSeconds: l.durationSeconds,
        order: l.order,
        moduleId: m.moduleId
      }))
    ) || []
  } : null;

  const handleEnroll = async () => {
    if (!course) return;
    if (!auth?.user) {
      alert('Vui lòng đăng nhập trước khi đăng ký khóa học.');
      return;
    }

    try {
      setEnrollError(null);
      await enrollMutation({
        variables: { courseId: course.id }
      });
      setIsEnrolled(true);
      alert('Đăng ký khóa học thành công!');
      // Reload lại trang hoặc refetch query 
      window.location.reload(); 
    } catch (err: any) {
      console.error(err);
      setEnrollError(err.message || 'Đăng ký thất bại.');
    }
  };

  if (loading) return <Layout><div className="p-12 text-center">Đang tải khóa học...</div></Layout>;
  if (error || !course) return <Layout><div className="p-12 text-center text-red-500">Không tìm thấy khóa học</div></Layout>;

  // Tính toán thời gian
  const totalMinutes = Math.round(course.totalDurationSeconds / 60);
  const totalHours = Math.floor(totalMinutes / 60);

  return (
    <Layout>
      <CourseHero course={course} totalHours={totalHours} />
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <CourseInfo course={course} totalHours={totalHours} />
            <CourseLessonList course={course} />
            <CourseReviews courseId={course.id} isEnrolled={isEnrolled} />
          </div>
          <div className="lg:col-span-1">
            <CourseSidebar
              course={course}
              totalHours={totalHours}
              isEnrolled={isEnrolled} 
              isEnrollLoading={isEnrollLoading}
              enrollError={enrollError}
              onEnroll={handleEnroll}
            />
          </div>
        </div>
      </div>
    </Layout>
  );
};