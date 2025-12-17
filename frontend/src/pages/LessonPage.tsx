import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useQuery } from '@apollo/client';
import { Layout } from '../components/Layout';
import { VideoPlayer } from '../components/VideoPlayer';
import { Button } from '../components/Button';
import type { CourseDetail, Lesson, Progress } from '../types';
import { LessonSidebar } from '../components/lesson/LessonSidebar';
import { GET_COURSE_BY_SLUG } from '../graphql/queries/course';

export const LessonPage = () => {
  const { slug, id } = useParams<{ slug: string; id: string }>();
  const navigate = useNavigate();

  // Gọi GraphQL lấy toàn bộ nội dung khóa học
  const { data, loading, error } = useQuery(GET_COURSE_BY_SLUG, {
    variables: { slug },
    skip: !slug
  });

  const [course, setCourse] = useState<CourseDetail | null>(null);
  const [currentLesson, setCurrentLesson] = useState<Lesson | null>(null);

  useEffect(() => {
    if (data?.getCourseBySlug) {
      // Map data từ Backend
      const rawCourse = data.getCourseBySlug;
      const allLessons = rawCourse.modules?.flatMap((m: any) => 
        m.lessons.map((l: any) => ({
          id: l.lessonId,
          title: l.title,
          videoUrl: l.videoUrl, //null nếu chưa enroll
          content: l.content,
          durationSeconds: l.durationSeconds,
          order: l.order
        }))
      ) || [];

      setCourse({
        id: rawCourse.courseId,
        title: rawCourse.title,
        slug: rawCourse.slug,
        lessons: allLessons,
      } as CourseDetail);

      const foundLesson = allLessons.find((l: any) => l.id === id);
      setCurrentLesson(foundLesson || null);
    }
  }, [data, id]);

  if (loading) return <Layout><div className="p-12">Đang tải bài học...</div></Layout>;
  if (error || !course || !currentLesson) return <Layout><div className="p-12 text-red-500">Bài học không tìm thấy</div></Layout>;

  // Kiểm tra quyền xem video
  const isVideoAvailable = !!currentLesson.videoUrl;

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 py-12 grid grid-cols-1 lg:grid-cols-4 gap-8">
        <div className="lg:col-span-3">
          {isVideoAvailable ? (
            <VideoPlayer
              videoUrl={currentLesson.videoUrl!}
              title={currentLesson.title}
              durationSeconds={currentLesson.durationSeconds}
              lessonId={currentLesson.id}
              onProgress={(p) => console.log('Progress:', p)}
            />
          ) : (
            <div className="aspect-video w-full rounded-lg bg-gray-100 border border-dashed border-gray-300 flex flex-col items-center justify-center text-center px-6">
              <p className="text-lg font-semibold text-gray-800 mb-2">
                Bạn cần đăng ký khóa học để xem video bài học này.
              </p>
              <Button variant="primary" onClick={() => navigate(`/courses/${slug}`)}>
                Quay lại trang khóa học
              </Button>
            </div>
          )}

          <h1 className="text-3xl font-bold mt-6">{currentLesson.title}</h1>
          <p className="text-gray-600 mb-6">{currentLesson.content}</p>
        </div>

        <div className="lg:col-span-1">
          <LessonSidebar
            courseTitle={course.title}
            lessons={course.lessons}
            currentLessonId={id!}
            courseSlug={slug!}
          />
        </div>
      </div>
    </Layout>
  );
};