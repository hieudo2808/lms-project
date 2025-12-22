import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, 
  BookOpen, 
  Users, 
  BarChart2, 
  MessageSquare, 
  Settings
} from 'lucide-react';

const SidebarItem = ({ icon: Icon, label, to }: { icon: any, label: string, to: string }) => {
  return (
    <NavLink
      to={to}
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

export const InstructorSidebar = () => {
  return (
    <div className="w-64 bg-white border-r border-gray-200 h-screen fixed left-0 top-0 flex flex-col z-50">
      {/* Logo Area */}
      <div className="p-6 border-b border-gray-100 flex items-center gap-3">
        <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
          <span className="text-white font-bold text-xl">L</span>
        </div>
        <span className="text-xl font-bold text-gray-800">LMS Giảng Viên</span>
      </div>

      {/* Menu Items */}
      <div className="flex-1 overflow-y-auto py-6 px-3 space-y-2">
        <SidebarItem icon={LayoutDashboard} label="Tổng quan" to="/instructor/dashboard" />
        <SidebarItem icon={BookOpen} label="Quản lý khóa học" to="/instructor/my-courses" />
        <SidebarItem icon={Users} label="Học viên" to="/instructor/students" />
        <SidebarItem icon={BarChart2} label="Phân tích & Doanh thu" to="/instructor/analytics" />
        <SidebarItem icon={MessageSquare} label="Đánh giá & Hỏi đáp" to="/instructor/reviews" />
        
        <div className="pt-6 mt-6 border-t border-gray-100">
            <span className="px-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">Hệ thống</span>
            <div className="mt-2 space-y-2">
                <SidebarItem icon={Settings} label="Cài đặt tài khoản" to="/instructor/settings" />
            </div>
        </div>
      </div>
    </div>
  );
};