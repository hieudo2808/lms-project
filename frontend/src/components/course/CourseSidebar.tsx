import { Link } from 'react-router-dom';
import type { CourseDetail } from '../../types';

interface CourseSidebarProps {
  course: CourseDetail;
  totalHours: number;
  isEnrolled: boolean;
  isEnrollLoading?: boolean;
  enrollError?: string | null;
  onEnroll: () => void;
}

const formatCurrency = (value: number) =>
  value === 0
    ? 'Miễn phí'
    : value.toLocaleString('vi-VN', {
        style: 'currency',
        currency: 'VND',
      });

export const CourseSidebar = ({
  course,
  totalHours,
  isEnrolled,
  isEnrollLoading = false,
  enrollError,
  onEnroll,
}: CourseSidebarProps) => {
  const isFree = course.price === 0;

  const mainLabel = isEnrolled
    ? '✓ Đã đăng ký'
    : isEnrollLoading
    ? 'Đang xử lý...'
    : isFree
    ? 'Đăng ký khóa học'
    : `Mua ngay - ${formatCurrency(course.price)}`;

  return (
    <div className="bg-white rounded-2xl shadow-xl p-6 sticky top-24 border border-gray-200">
      {enrollError && (
        <p className="mb-3 text-sm text-red-600">{enrollError}</p>
      )}

      <button
        onClick={onEnroll}
        disabled={isEnrollLoading || isEnrolled}
        className={`w-full py-3 px-4 rounded-lg font-bold text-lg transition-all mb-3 disabled:opacity-70 disabled:cursor-not-allowed ${
          isEnrolled
            ? 'bg-gray-200 text-gray-800'
            : 'bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:shadow-lg hover:scale-105'
        }`}
      >
        {mainLabel}
      </button>

      <p className="text-center text-sm text-gray-600 mb-2">
        {isFree ? (
          <>
            Giá:{' '}
            <span className="font-semibold text-green-600">Miễn phí</span>
          </>
        ) : (
          <>
            Giá:{' '}
            <span className="font-semibold">
              {formatCurrency(course.price)}
            </span>
          </>
        )}
      </p>

      {isEnrolled && (
        <Link
          to={`/courses/${course.slug}/lesson/${course.lessons[0]?.id || '1'}`}
        >
          <button className="w-full py-3 px-4 rounded-lg font-bold text-lg bg-gradient-to-r from-green-500 to-emerald-600 text-white hover:shadow-lg transition-all">
            🎬 Bắt đầu học
          </button>
        </Link>
      )}

      <div className="mt-8 pt-6 border-t border-gray-200 space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-gray-600">⭐ Đánh giá</span>
          <span className="font-bold text-lg">
            {course.rating.toFixed(1)}/5
          </span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-gray-600">👥 Học viên</span>
          <span className="font-bold">
            {course.enrolledCount.toLocaleString()}
          </span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-gray-600">📚 Bài học</span>
          <span className="font-bold">{course.lessonsCount}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-gray-600">⏱ Thời lượng</span>
          <span className="font-bold">{totalHours}h</span>
        </div>
      </div>

      <div className="mt-8 pt-6 border-t border-gray-200">
        <p className="text-xs uppercase text-gray-500 font-bold mb-3">
          Giáo viên
        </p>
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white font-bold">
            {course.instructorName[0]}
          </div>
          <div>
            <p className="font-bold text-gray-900">{course.instructorName}</p>
            <p className="text-xs text-gray-500">Chuyên gia</p>
          </div>
        </div>
      </div>
    </div>
  );
};
