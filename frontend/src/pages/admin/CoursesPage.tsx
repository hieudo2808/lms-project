import { useState } from "react";
import { useQuery, useMutation } from "@apollo/client";
import {
  BookOpen,
  Loader2,
  CheckCircle,
  XCircle,
  Trash2,
  Search,
  Filter,
  AlertCircle,
  Eye,
} from "lucide-react";
import { GET_ALL_COURSES_ADMIN } from "../../graphql/queries/admin";
import {
  APPROVE_COURSE,
  REJECT_COURSE,
  DELETE_COURSE_ADMIN,
} from "../../graphql/mutations/admin";

interface Course {
  courseId: string;
  title: string;
  slug: string;
  thumbnailUrl: string | null;
  level: string;
  price: number;
  isPublished: boolean;
  instructor: {
    userId: string;
    fullName: string;
    email: string;
  } | null;
  createdAt: string;
}

export const CoursesPage = () => {
  const [publishedFilter, setPublishedFilter] = useState<boolean | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [actionMessage, setActionMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  const { data, loading, error, refetch } = useQuery(GET_ALL_COURSES_ADMIN, {
    variables: { isPublished: publishedFilter, page: 0, limit: 50 },
    fetchPolicy: "network-only",
  });

  const [approveCourse, { loading: approving }] = useMutation(APPROVE_COURSE);
  const [rejectCourse, { loading: rejecting }] = useMutation(REJECT_COURSE);
  const [deleteCourse, { loading: deleting }] =
    useMutation(DELETE_COURSE_ADMIN);

  const courses: Course[] = data?.getAllCoursesAdmin || [];

  const filteredCourses = courses.filter(
    (course) =>
      course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      course.instructor?.fullName
        .toLowerCase()
        .includes(searchTerm.toLowerCase())
  );

  const handleApprove = async (courseId: string, title: string) => {
    if (!confirm(`Duyệt và xuất bản khóa học "${title}"?`)) return;

    try {
      await approveCourse({ variables: { courseId } });
      setActionMessage({
        type: "success",
        text: `Đã duyệt khóa học "${title}"`,
      });
      refetch();
    } catch (err: any) {
      setActionMessage({ type: "error", text: err.message });
    }

    setTimeout(() => setActionMessage(null), 3000);
  };

  const handleReject = async (courseId: string, title: string) => {
    const reason = prompt(`Nhập lý do từ chối khóa học "${title}":`);
    if (!reason) return;

    try {
      await rejectCourse({ variables: { courseId, reason } });
      setActionMessage({
        type: "success",
        text: `Đã từ chối khóa học "${title}"`,
      });
      refetch();
    } catch (err: any) {
      setActionMessage({ type: "error", text: err.message });
    }

    setTimeout(() => setActionMessage(null), 3000);
  };

  const handleDelete = async (courseId: string, title: string) => {
    if (
      !confirm(
        `XÓA VĨNH VIỄN khóa học "${title}"? Hành động này không thể hoàn tác!`
      )
    )
      return;

    try {
      await deleteCourse({ variables: { courseId } });
      setActionMessage({ type: "success", text: `Đã xóa khóa học "${title}"` });
      refetch();
    } catch (err: any) {
      setActionMessage({ type: "error", text: err.message });
    }

    setTimeout(() => setActionMessage(null), 3000);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount);
  };

  const formatDate = (dateStr: string) => {
    try {
      return new Date(dateStr).toLocaleDateString("vi-VN");
    } catch {
      return dateStr;
    }
  };

  const getLevelBadge = (level: string) => {
    const styles: Record<string, string> = {
      BEGINNER: "bg-green-100 text-green-700",
      INTERMEDIATE: "bg-yellow-100 text-yellow-700",
      ADVANCED: "bg-red-100 text-red-700",
    };
    const labels: Record<string, string> = {
      BEGINNER: "Cơ bản",
      INTERMEDIATE: "Trung bình",
      ADVANCED: "Nâng cao",
    };
    return (
      <span
        className={`px-2 py-1 rounded-full text-xs font-medium ${
          styles[level] || "bg-gray-100"
        }`}
      >
        {labels[level] || level}
      </span>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            <BookOpen className="w-7 h-7 text-indigo-600" />
            Quản lý khóa học
          </h1>
          <p className="text-gray-500 mt-1">
            Duyệt và quản lý khóa học trong hệ thống
          </p>
        </div>
      </div>

      {/* Action Message */}
      {actionMessage && (
        <div
          className={`p-4 rounded-lg flex items-center gap-2 ${
            actionMessage.type === "success"
              ? "bg-green-50 text-green-700"
              : "bg-red-50 text-red-700"
          }`}
        >
          {actionMessage.type === "success" ? (
            <CheckCircle className="w-5 h-5" />
          ) : (
            <AlertCircle className="w-5 h-5" />
          )}
          {actionMessage.text}
        </div>
      )}

      {/* Filters */}
      <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex flex-wrap gap-4 items-center">
        <div className="flex items-center gap-2 flex-1 min-w-0 sm:min-w-[200px]">
          <Search className="w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Tìm kiếm theo tên khóa học hoặc giảng viên..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="flex-1 px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
          />
        </div>

        <div className="flex items-center gap-2">
          <Filter className="w-5 h-5 text-gray-400" />
          <select
            value={publishedFilter === null ? "" : publishedFilter.toString()}
            onChange={(e) =>
              setPublishedFilter(
                e.target.value === "" ? null : e.target.value === "true"
              )
            }
            className="px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
          >
            <option value="">Tất cả trạng thái</option>
            <option value="true">Đã xuất bản</option>
            <option value="false">Chờ duyệt</option>
          </select>
        </div>
      </div>

      {/* Courses Table */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
          </div>
        ) : error ? (
          <div className="p-6 text-red-600">Lỗi: {error.message}</div>
        ) : filteredCourses.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <BookOpen className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <p>Không có khóa học nào</p>
          </div>
        ) : (
          <>
            {/* Desktop Table */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">
                      Khóa học
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">
                      Giảng viên
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">
                      Trình độ
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">
                      Giá
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">
                      Trạng thái
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-semibold text-gray-600 uppercase">
                      Thao tác
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filteredCourses.map((course) => (
                    <tr key={course.courseId} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <img
                            src={
                              course.thumbnailUrl ||
                              "https://via.placeholder.com/60x40?text=Course"
                            }
                            alt=""
                            className="w-14 h-10 rounded-lg object-cover"
                          />
                          <div className="max-w-full sm:max-w-[200px] truncate">
                            <p className="font-medium text-gray-800 truncate">
                              {course.title}
                            </p>
                            <p className="text-xs text-gray-400">
                              {formatDate(course.createdAt)}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-sm text-gray-800">
                          {course.instructor?.fullName || "N/A"}
                        </p>
                        <p className="text-xs text-gray-400">
                          {course.instructor?.email}
                        </p>
                      </td>
                      <td className="px-6 py-4">{getLevelBadge(course.level)}</td>
                      <td className="px-6 py-4 text-sm font-medium text-gray-800">
                        {formatCurrency(course.price || 0)}
                      </td>
                      <td className="px-6 py-4">
                        {course.isPublished ? (
                          <span className="px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium">
                            Đã xuất bản
                          </span>
                        ) : (
                          <span className="px-2 py-1 bg-yellow-100 text-yellow-700 rounded-full text-xs font-medium">
                            Chờ duyệt
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-end gap-2">
                          <a
                            href={`/courses/${course.slug}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                            title="Xem khóa học"
                          >
                            <Eye className="w-4 h-4" />
                          </a>
                          {!course.isPublished && (
                            <>
                              <button
                                onClick={() =>
                                  handleApprove(course.courseId, course.title)
                                }
                                disabled={approving}
                                className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors disabled:opacity-50"
                                title="Duyệt"
                              >
                                <CheckCircle className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() =>
                                  handleReject(course.courseId, course.title)
                                }
                                disabled={rejecting}
                                className="p-2 text-yellow-600 hover:bg-yellow-50 rounded-lg transition-colors disabled:opacity-50"
                                title="Từ chối"
                              >
                                <XCircle className="w-4 h-4" />
                              </button>
                            </>
                          )}
                          <button
                            onClick={() =>
                              handleDelete(course.courseId, course.title)
                            }
                            disabled={deleting}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                            title="Xóa"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Card View */}
            <div className="md:hidden space-y-3 p-4">
              {filteredCourses.map((course) => (
                <div
                  key={course.courseId}
                  className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm"
                >
                  <div className="flex gap-3 mb-3">
                    <img
                      src={
                        course.thumbnailUrl ||
                        "https://via.placeholder.com/80x60?text=Course"
                      }
                      alt=""
                      className="w-20 h-14 rounded-lg object-cover flex-shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-gray-800 text-sm mb-1 line-clamp-2">
                        {course.title}
                      </h3>
                      <p className="text-xs text-gray-500">
                        {course.instructor?.fullName || "N/A"}
                      </p>
                    </div>
                  </div>
                  <div className="flex flex-wrap items-center gap-2 mb-3">
                    {getLevelBadge(course.level)}
                    <span className="text-sm font-semibold text-gray-800">
                      {formatCurrency(course.price || 0)}
                    </span>
                    {course.isPublished ? (
                      <span className="px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium">
                        Đã xuất bản
                      </span>
                    ) : (
                      <span className="px-2 py-1 bg-yellow-100 text-yellow-700 rounded-full text-xs font-medium">
                        Chờ duyệt
                      </span>
                    )}
                  </div>
                  <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                    <span className="text-xs text-gray-500">
                      {formatDate(course.createdAt)}
                    </span>
                    <div className="flex items-center gap-1">
                      <a
                        href={`/courses/${course.slug}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                        title="Xem"
                      >
                        <Eye className="w-4 h-4" />
                      </a>
                      {!course.isPublished && (
                        <>
                          <button
                            onClick={() =>
                              handleApprove(course.courseId, course.title)
                            }
                            disabled={approving}
                            className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors disabled:opacity-50"
                            title="Duyệt"
                          >
                            <CheckCircle className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() =>
                              handleReject(course.courseId, course.title)
                            }
                            disabled={rejecting}
                            className="p-2 text-yellow-600 hover:bg-yellow-50 rounded-lg transition-colors disabled:opacity-50"
                            title="Từ chối"
                          >
                            <XCircle className="w-4 h-4" />
                          </button>
                        </>
                      )}
                      <button
                        onClick={() =>
                          handleDelete(course.courseId, course.title)
                        }
                        disabled={deleting}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                        title="Xóa"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      {/* Summary */}
      {!loading && !error && (
        <div className="text-sm text-gray-500 text-right">
          Hiển thị {filteredCourses.length} / {courses.length} khóa học
        </div>
      )}
    </div>
  );
};
