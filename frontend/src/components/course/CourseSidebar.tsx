import { useNavigate } from 'react-router-dom';

interface CourseSidebarProps {
    courseId: string;
    slug: string;
    price: number;
    isEnrolled: boolean;
    isEnrollLoading: boolean;
    isPreviewMode: boolean;
    onEnroll: () => void;
}

export const CourseSidebar = ({
    slug,
    price,
    isEnrolled,
    isEnrollLoading,
    isPreviewMode,
    onEnroll,
}: CourseSidebarProps) => {
    const navigate = useNavigate();

    return (
        <div className="lg:col-span-1">
            <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-200 sticky top-24 space-y-4">
                <div className="text-4xl font-bold text-blue-600">
                    {price === 0 ? 'Miễn phí' : `${(price ?? 0).toLocaleString()} đ`}
                </div>
                <p className="text-gray-500 text-sm line-through">{((price ?? 0) * 1.5).toLocaleString()} đ</p>

                {isPreviewMode ? (
                    <div className="w-full bg-amber-100 border border-amber-300 text-amber-800 font-semibold py-4 px-4 rounded-lg text-center">
                        <div className="flex items-center justify-center gap-2 mb-1">
                            <span>👁️</span> Chế độ xem trước
                        </div>
                        <p className="text-sm font-normal text-amber-700">
                            Bạn đang xem trước khóa học với tư cách giảng viên/quản trị viên
                        </p>
                    </div>
                ) : (
                    <button
                        onClick={onEnroll}
                        disabled={isEnrollLoading}
                        className="w-full bg-blue-600 text-white font-bold py-4 rounded-lg hover:bg-blue-700 transition-all shadow-md active:transform active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed"
                    >
                        {isEnrolled ? 'Vào học' : isEnrollLoading ? 'Đang xử lý...' : 'Đăng ký ngay'}
                    </button>
                )}

                {isEnrolled && (
                    <button
                        onClick={() => navigate(`/courses/${slug}/progress`)}
                        className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-semibold py-3 rounded-lg hover:shadow-lg transition-all flex items-center justify-center gap-2"
                    >
                        📊 Xem tiến độ học tập
                    </button>
                )}

                <ul className="space-y-2 text-sm text-gray-600">
                    <li className="flex gap-2">✅ Truy cập trọn đời</li>
                    <li className="flex gap-2">✅ Học trên mọi thiết bị</li>
                    <li className="flex gap-2">✅ Cấp chứng chỉ khi hoàn thành</li>
                </ul>
            </div>
        </div>
    );
};
