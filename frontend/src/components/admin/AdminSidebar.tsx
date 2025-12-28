import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Users, BookOpen, CreditCard, Settings, Shield, FolderTree, X } from 'lucide-react';

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
                        ? 'bg-red-600 text-white shadow-md shadow-red-200/30'
                        : 'text-gray-300 hover:bg-slate-800 hover:text-white'
                }`
            }
        >
            <Icon className="w-5 h-5" />
            <span className="font-medium">{label}</span>
        </NavLink>
    );
};

interface AdminSidebarProps {
    isOpen: boolean;
    onClose: () => void;
}

export const AdminSidebar = ({ isOpen, onClose }: AdminSidebarProps) => {
    return (
        <>
            {/* Mobile overlay */}
            {isOpen && <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={onClose} />}

            {/* Sidebar */}
            <div
                className={`w-64 bg-slate-900 border-r border-slate-700 h-screen fixed left-0 top-0 flex flex-col z-50 transition-transform duration-300 lg:translate-x-0 ${
                    isOpen ? 'translate-x-0' : '-translate-x-full'
                }`}
            >
                {/* Logo Area */}
                <div className="p-4 sm:p-6 border-b border-slate-700 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-red-600 rounded-lg flex items-center justify-center">
                            <Shield className="w-5 h-5 text-white" />
                        </div>
                        <div>
                            <span className="text-lg sm:text-xl font-bold text-white">LMS Admin</span>
                            <p className="text-xs text-slate-400">Quản trị hệ thống</p>
                        </div>
                    </div>

                    {/* Close button for mobile */}
                    <button onClick={onClose} className="lg:hidden p-2 rounded-lg hover:bg-slate-800 text-gray-400">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Menu Items */}
                <div className="flex-1 overflow-y-auto py-4 sm:py-6 px-3 space-y-2">
                    <SidebarItem icon={LayoutDashboard} label="Dashboard" to="/admin/dashboard" onClick={onClose} />
                    <SidebarItem icon={Users} label="Người dùng" to="/admin/users" onClick={onClose} />
                    <SidebarItem icon={FolderTree} label="Danh mục" to="/admin/categories" onClick={onClose} />
                    <SidebarItem icon={BookOpen} label="Khóa học" to="/admin/courses" onClick={onClose} />
                    <SidebarItem icon={CreditCard} label="Thanh toán" to="/admin/payments" onClick={onClose} />

                    <div className="pt-6 mt-6 border-t border-slate-700">
                        <span className="px-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                            Hệ thống
                        </span>
                        <div className="mt-2 space-y-2">
                            <SidebarItem icon={Settings} label="Cài đặt" to="/admin/settings" onClick={onClose} />
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};
