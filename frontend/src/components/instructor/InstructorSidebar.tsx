import { NavLink } from 'react-router-dom';
import { LayoutDashboard, BookOpen, Users, BarChart2, MessageSquare, Settings, X } from 'lucide-react';

const SidebarItem = ({
    icon: Icon,
    label,
    to,
    onClick,
}: {
    icon: any;
    label: string;
    to: string;
    onClick?: () => void;
}) => {
    return (
        <NavLink
            to={to}
            onClick={onClick}
            className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 group ${
                    isActive
                        ? 'bg-blue-600 text-white shadow-md shadow-blue-200'
                        : 'text-gray-600 hover:bg-blue-50 hover:text-blue-600'
                }`
            }
        >
            <Icon className="w-5 h-5" />
            <span className="font-medium">{label}</span>
        </NavLink>
    );
};

interface InstructorSidebarProps {
    isOpen: boolean;
    onClose: () => void;
}

export const InstructorSidebar = ({ isOpen, onClose }: InstructorSidebarProps) => {
    return (
        <>
            {isOpen && <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={onClose} />}

            <div
                className={`w-64 bg-white border-r border-gray-200 h-screen fixed left-0 top-0 flex flex-col z-50 transition-transform duration-300 lg:translate-x-0 ${
                    isOpen ? 'translate-x-0' : '-translate-x-full'
                }`}
            >
                <div className="p-4 sm:p-6 border-b border-gray-100 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                            <span className="text-white font-bold text-xl">L</span>
                        </div>
                        <span className="text-lg sm:text-xl font-bold text-gray-800">LMS Giảng Viên</span>
                    </div>

                    <button onClick={onClose} className="lg:hidden p-2 rounded-lg hover:bg-gray-100 text-gray-600">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto py-4 sm:py-6 px-3 space-y-2">
                    <SidebarItem
                        icon={LayoutDashboard}
                        label="Tổng quan"
                        to="/instructor/dashboard"
                        onClick={onClose}
                    />
                    <SidebarItem
                        icon={BookOpen}
                        label="Quản lý khóa học"
                        to="/instructor/my-courses"
                        onClick={onClose}
                    />
                    <SidebarItem icon={Users} label="Học viên" to="/instructor/students" onClick={onClose} />
                    <SidebarItem
                        icon={BarChart2}
                        label="Phân tích & Doanh thu"
                        to="/instructor/analytics"
                        onClick={onClose}
                    />
                    <SidebarItem
                        icon={MessageSquare}
                        label="Đánh giá & Hỏi đáp"
                        to="/instructor/reviews"
                        onClick={onClose}
                    />

                    <div className="pt-6 mt-6 border-t border-gray-100">
                        <span className="px-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                            Hệ thống
                        </span>
                        <div className="mt-2 space-y-2">
                            <SidebarItem
                                icon={Settings}
                                label="Cài đặt tài khoản"
                                to="/instructor/settings"
                                onClick={onClose}
                            />
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};
