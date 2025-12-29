import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation } from '@apollo/client';
import { toast } from 'react-toastify';
import { Plus, Edit3, Trash2, BookOpen, BarChart, DollarSign, Calendar, AlertCircle } from 'lucide-react';

import { GET_MY_COURSES_QUERY } from '../../graphql/queries/instructor';
import { DELETE_COURSE_MUTATION } from '../../graphql/mutations/instructor';

const LEVEL_LABEL: Record<string, string> = {
    BEGINNER: 'Cơ bản',
    INTERMEDIATE: 'Trung cấp',
    ADVANCED: 'Nâng cao',
};

export const MyCoursesPage = () => {
    const navigate = useNavigate();

    const { data, loading, error, refetch } = useQuery(GET_MY_COURSES_QUERY, {
        fetchPolicy: 'network-only',
    });

    const [deleteCourse] = useMutation(DELETE_COURSE_MUTATION);

    const handleDelete = async (courseId: string, title: string) => {
        if (window.confirm(`Bạn có chắc chắn muốn xóa khóa học: "${title}"?`)) {
            try {
                await deleteCourse({ variables: { courseId } });
                toast.success('Đã xóa khóa học thành công!');
                refetch();
            } catch (err: any) {
                toast.error('Lỗi xóa khóa học: ' + err.message);
            }
        }
    };

    if (loading)
        return (
            <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
            </div>
        );

    if (error)
        return (
            <div className="bg-red-50 p-6 rounded-xl border border-red-200 text-center">
                <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-3" />
                <h3 className="text-lg font-bold text-red-800">Không thể tải danh sách khóa học</h3>
                <p className="text-red-600">{error.message}</p>
            </div>
        );

    const courses = data?.getMyCourses || [];

    return (
        <div className="max-w-7xl mx-auto space-y-8">
            <div className="flex justify-between items-center bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                <div>
                    <h1 className="text-2xl font-extrabold text-gray-900">Quản lý khóa học</h1>
                    <p className="text-gray-500 text-sm mt-1">
                        Danh sách tất cả các khóa học bạn đã khởi tạo trên hệ thống.
                    </p>
                </div>
                <button
                    onClick={() => navigate('/instructor/create-course')}
                    className="flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-100 active:scale-95"
                >
                    <Plus size={20} /> Tạo khóa học mới
                </button>
            </div>

            {courses.length === 0 ? (
                <div className="bg-white rounded-3xl border-2 border-dashed border-gray-200 py-24 text-center">
                    <div className="bg-gray-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
                        <BookOpen size={40} className="text-gray-300" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-800">Chưa có khóa học nào</h3>
                    <p className="text-gray-500 mt-2 mb-8">Hãy bắt đầu khởi tạo khóa học đầu tiên của bạn.</p>
                    <button
                        onClick={() => navigate('/instructor/create-course')}
                        className="text-blue-600 font-bold hover:underline"
                    >
                        + Tạo ngay bây giờ
                    </button>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {courses.map((course: any) => (
                        <div
                            key={course.courseId}
                            className="group bg-white rounded-2xl border border-gray-200 overflow-hidden hover:shadow-2xl hover:shadow-blue-50 transition-all duration-300 flex flex-col"
                        >
                            <div className="h-48 bg-gray-100 relative overflow-hidden">
                                {course.thumbnailUrl ? (
                                    <img
                                        src={course.thumbnailUrl}
                                        alt={course.title}
                                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                                    />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-gray-400">
                                        <BookOpen size={48} className="opacity-20" />
                                    </div>
                                )}
                                <div
                                    className={`absolute top-4 right-4 px-3 py-1 rounded-full text-[10px] font-black tracking-widest shadow-sm ${
                                        course.isPublished
                                            ? 'bg-green-500 text-white'
                                            : 'bg-gray-900/80 text-white backdrop-blur-md'
                                    }`}
                                >
                                    {course.isPublished ? 'CÔNG KHAI' : 'BẢN NHÁP'}
                                </div>
                            </div>

                            <div className="p-6 flex-1 flex flex-col">
                                <h3
                                    className="font-bold text-gray-900 text-lg leading-tight mb-4 line-clamp-2 h-12"
                                    title={course.title}
                                >
                                    {course.title}
                                </h3>

                                <div className="grid grid-cols-2 gap-4 text-xs font-medium text-gray-500 mb-6">
                                    <div className="flex items-center gap-2 bg-gray-50 p-2 rounded-lg">
                                        <BarChart size={16} className="text-blue-500" />
                                        <span>{LEVEL_LABEL[course.level] || 'Không xác định'}</span>
                                    </div>
                                    <div className="flex items-center gap-2 bg-gray-50 p-2 rounded-lg">
                                        <DollarSign size={16} className="text-green-600" />
                                        <span className="text-gray-900 font-bold">
                                            {course.price > 0
                                                ? new Intl.NumberFormat('vi-VN').format(course.price) + 'đ'
                                                : 'Miễn phí'}
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-2 col-span-2 bg-gray-50 p-2 rounded-lg">
                                        <Calendar size={16} className="text-purple-500" />
                                        <span>
                                            Cập nhật:{' '}
                                            {new Date(course.updatedAt || course.createdAt).toLocaleDateString('vi-VN')}
                                        </span>
                                    </div>
                                </div>

                                <div className="mt-auto pt-5 border-t border-gray-100 flex gap-3">
                                    <button
                                        onClick={() => navigate(`/instructor/courses/${course.slug}/edit`)}
                                        className="flex-1 flex items-center justify-center gap-2 bg-blue-50 text-blue-700 py-3 rounded-xl font-bold hover:bg-blue-100 transition-colors"
                                    >
                                        <Edit3 size={18} /> Biên tập
                                    </button>
                                    <button
                                        onClick={() => handleDelete(course.courseId, course.title)}
                                        className="p-3 bg-red-50 text-red-500 rounded-xl hover:bg-red-100 transition-colors"
                                        title="Xóa khóa học"
                                    >
                                        <Trash2 size={18} />
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};
