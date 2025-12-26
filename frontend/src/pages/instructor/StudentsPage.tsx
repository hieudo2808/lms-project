import { useState } from 'react';
import { useQuery, useMutation } from '@apollo/client';
import { Users, Loader2, BookOpen, TrendingUp, Calendar, Mail, UserX } from 'lucide-react';
import { GET_MY_COURSES_QUERY, GET_STUDENT_PROGRESS } from '../../graphql/queries/instructor';
import { REMOVE_STUDENT_FROM_COURSE } from '../../graphql/mutations/student';
import { toast } from 'react-toastify';

interface Course {
    courseId: string;
    title: string;
}

interface StudentProgress {
    userId: string;
    fullName: string;
    email: string;
    enrolledAt: string;
    progressPercent: number;
    completedLessons: number;
    totalLessons: number;
}

export const StudentsPage = () => {
    const [selectedCourseId, setSelectedCourseId] = useState<string>('');

    // Lấy danh sách khóa học
    const { data: coursesData, loading: coursesLoading } = useQuery(GET_MY_COURSES_QUERY);
    const courses: Course[] = coursesData?.getMyCourses || [];

    // Lấy tiến độ học viên khi chọn khóa học
    const {
        data: studentsData,
        loading: studentsLoading,
        refetch,
    } = useQuery(GET_STUDENT_PROGRESS, {
        variables: { courseId: selectedCourseId },
        skip: !selectedCourseId,
    });
    const students: StudentProgress[] = studentsData?.getStudentProgress || [];

    const [removeStudent] = useMutation(REMOVE_STUDENT_FROM_COURSE);

    const handleKickStudent = async (userId: string, fullName: string) => {
        if (!window.confirm(`Bạn có chắc muốn xóa học viên "${fullName}" khỏi khóa học này?`)) {
            return;
        }
        try {
            await removeStudent({
                variables: { courseId: selectedCourseId, userId },
            });
            toast.success(`Đã xóa học viên "${fullName}" khỏi khóa học`);
            refetch();
        } catch (err: any) {
            toast.error('Lỗi: ' + err.message);
        }
    };

    const formatDate = (dateStr: string) => {
        try {
            return new Date(dateStr).toLocaleDateString('vi-VN');
        } catch {
            return dateStr;
        }
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                        <Users className="w-7 h-7 text-purple-600" />
                        Quản lý học viên
                    </h1>
                    <p className="text-gray-500 mt-1">Theo dõi tiến độ học viên trong các khóa học của bạn</p>
                </div>
            </div>

            {/* Course Selector */}
            <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
                <label className="block text-sm font-medium text-gray-700 mb-2">Chọn khóa học</label>
                {coursesLoading ? (
                    <div className="flex items-center gap-2 text-gray-500">
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Đang tải...
                    </div>
                ) : (
                    <select
                        value={selectedCourseId}
                        onChange={(e) => setSelectedCourseId(e.target.value)}
                        className="w-full max-w-md px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                    >
                        <option value="">-- Chọn khóa học --</option>
                        {courses.map((course) => (
                            <option key={course.courseId} value={course.courseId}>
                                {course.title}
                            </option>
                        ))}
                    </select>
                )}
            </div>

            {/* Students Table */}
            {selectedCourseId && (
                <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
                    {studentsLoading ? (
                        <div className="flex items-center justify-center py-12">
                            <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
                        </div>
                    ) : students.length === 0 ? (
                        <div className="text-center py-12 text-gray-500">
                            <Users className="w-12 h-12 mx-auto mb-3 opacity-30" />
                            <p>Chưa có học viên nào đăng ký khóa học này</p>
                        </div>
                    ) : (
                        <>
                            {/* Stats */}
                            <div className="grid grid-cols-3 gap-4 p-6 bg-gray-50 border-b">
                                <div className="text-center">
                                    <p className="text-2xl font-bold text-purple-600">{students.length}</p>
                                    <p className="text-sm text-gray-500">Tổng học viên</p>
                                </div>
                                <div className="text-center">
                                    <p className="text-2xl font-bold text-blue-600">
                                        {Math.round(
                                            students.reduce((acc, s) => acc + s.progressPercent, 0) / students.length ||
                                                0,
                                        )}
                                        %
                                    </p>
                                    <p className="text-sm text-gray-500">Tiến độ TB</p>
                                </div>
                                <div className="text-center">
                                    <p className="text-2xl font-bold text-green-600">
                                        {students.filter((s) => s.progressPercent >= 100).length}
                                    </p>
                                    <p className="text-sm text-gray-500">Đã hoàn thành</p>
                                </div>
                            </div>

                            {/* Table */}
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead className="bg-gray-50 border-b">
                                        <tr>
                                            <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                                Học viên
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                                <Calendar className="w-4 h-4 inline mr-1" />
                                                Ngày đăng ký
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                                <BookOpen className="w-4 h-4 inline mr-1" />
                                                Bài học
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                                <TrendingUp className="w-4 h-4 inline mr-1" />
                                                Tiến độ
                                            </th>
                                            <th className="px-6 py-3 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                                Hành động
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100">
                                        {students.map((student) => (
                                            <tr key={student.userId} className="hover:bg-gray-50">
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center">
                                                            <span className="text-purple-600 font-semibold">
                                                                {student.fullName.charAt(0).toUpperCase()}
                                                            </span>
                                                        </div>
                                                        <div>
                                                            <p className="font-medium text-gray-800">
                                                                {student.fullName}
                                                            </p>
                                                            <p className="text-sm text-gray-500 flex items-center gap-1">
                                                                <Mail className="w-3 h-3" />
                                                                {student.email}
                                                            </p>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 text-gray-600">
                                                    {formatDate(student.enrolledAt)}
                                                </td>
                                                <td className="px-6 py-4 text-gray-600">
                                                    {student.completedLessons} / {student.totalLessons}
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-2">
                                                        <div className="w-24 bg-gray-200 rounded-full h-2">
                                                            <div
                                                                className={`h-2 rounded-full ${
                                                                    student.progressPercent >= 100
                                                                        ? 'bg-green-500'
                                                                        : student.progressPercent >= 50
                                                                        ? 'bg-blue-500'
                                                                        : 'bg-orange-500'
                                                                }`}
                                                                style={{
                                                                    width: `${Math.min(student.progressPercent, 100)}%`,
                                                                }}
                                                            />
                                                        </div>
                                                        <span className="text-sm font-medium text-gray-700">
                                                            {Math.round(student.progressPercent)}%
                                                        </span>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 text-center">
                                                    <button
                                                        onClick={() =>
                                                            handleKickStudent(student.userId, student.fullName)
                                                        }
                                                        className="text-red-500 hover:text-red-700 hover:bg-red-50 p-2 rounded-lg transition-colors"
                                                        title="Xóa học viên khỏi khóa học"
                                                    >
                                                        <UserX size={18} />
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </>
                    )}
                </div>
            )}

            {/* Empty state when no course selected */}
            {!selectedCourseId && (
                <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-12 text-center">
                    <BookOpen className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                    <p className="text-gray-500">Chọn một khóa học để xem danh sách học viên</p>
                </div>
            )}
        </div>
    );
};
