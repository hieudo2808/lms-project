interface CourseOverviewProps {
    description?: string;
    instructor?: {
        fullName: string;
        avatarUrl?: string;
        bio?: string;
    };
}

export const CourseOverview = ({ description, instructor }: CourseOverviewProps) => {
    return (
        <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
            <h2 className="text-2xl font-bold mb-4 text-gray-900">Bạn sẽ học được gì</h2>
            <p className="text-gray-700 leading-relaxed">
                {description || 'Khóa học giúp bạn nắm vững kiến thức cốt lõi và thực hành qua dự án thực tế.'}
            </p>

            {instructor && (
                <div className="mt-8 border-t border-gray-100 pt-6 flex items-center gap-4">
                    <img
                        src={instructor.avatarUrl || 'https://via.placeholder.com/80'}
                        alt={instructor.fullName}
                        className="w-14 h-14 rounded-full object-cover"
                    />
                    <div>
                        <div className="font-semibold text-gray-900">{instructor.fullName}</div>
                        <div className="text-gray-500 text-sm">{instructor.bio || 'Giảng viên uy tín tại LMS'}</div>
                    </div>
                </div>
            )}
        </div>
    );
};
