import { useState } from 'react';
import { useQuery, useMutation } from '@apollo/client';
import { UserAvatar } from '../../components/common/UserAvatar';
import {
    Users,
    Loader2,
    Lock,
    Unlock,
    Trash2,
    Search,
    Filter,
    AlertCircle,
    CheckCircle,
    Plus,
    Edit,
    X,
} from 'lucide-react';
import { GET_ALL_USERS, GET_ALL_ROLES } from '../../graphql/queries/admin';
import {
    LOCK_USER,
    UNLOCK_USER,
    DELETE_USER,
    UPDATE_USER_ROLE,
    CREATE_USER,
    UPDATE_USER,
} from '../../graphql/mutations/admin';

interface User {
    userId: string;
    fullName: string;
    email: string;
    avatarUrl: string | null;
    roleName: string;
    isActive: boolean;
    createdAt: string;
}

interface Role {
    roleId: string;
    roleName: string;
}

interface UserFormData {
    fullName: string;
    email: string;
    password: string;
    roleId: string;
}

export const UsersPage = () => {
    const [roleFilter, setRoleFilter] = useState<string>('');
    const [searchTerm, setSearchTerm] = useState('');
    const [actionMessage, setActionMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [editingUser, setEditingUser] = useState<User | null>(null);
    const [formData, setFormData] = useState<UserFormData>({ fullName: '', email: '', password: '', roleId: '' });

    const { data, loading, error, refetch } = useQuery(GET_ALL_USERS, {
        variables: { page: 0, limit: 50, roleName: roleFilter || null },
        fetchPolicy: 'network-only',
    });

    const { data: rolesData } = useQuery(GET_ALL_ROLES);

    const [lockUser, { loading: locking }] = useMutation(LOCK_USER);
    const [unlockUser, { loading: unlocking }] = useMutation(UNLOCK_USER);
    const [deleteUser, { loading: deleting }] = useMutation(DELETE_USER);
    const [updateUserRole, { loading: updatingRole }] = useMutation(UPDATE_USER_ROLE);
    const [createUser, { loading: creating }] = useMutation(CREATE_USER);
    const [updateUser, { loading: updating }] = useMutation(UPDATE_USER);

    const users: User[] = data?.getAllUsers || [];
    const roles: Role[] = rolesData?.getAllRoles || [];

    const filteredUsers = users.filter(
        (user) =>
            user.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            user.email.toLowerCase().includes(searchTerm.toLowerCase()),
    );

    const showMessage = (type: 'success' | 'error', text: string) => {
        setActionMessage({ type, text });
        setTimeout(() => setActionMessage(null), 3000);
    };

    const handleLock = async (userId: string, userName: string) => {
        const reason = prompt(`Nhập lý do khóa tài khoản "${userName}":`);
        if (!reason) return;
        try {
            await lockUser({ variables: { userId, reason } });
            showMessage('success', `Đã khóa tài khoản ${userName}`);
            refetch();
        } catch (err: any) {
            showMessage('error', err.message);
        }
    };

    const handleUnlock = async (userId: string, userName: string) => {
        if (!confirm(`Mở khóa tài khoản "${userName}"?`)) return;
        try {
            await unlockUser({ variables: { userId } });
            showMessage('success', `Đã mở khóa tài khoản ${userName}`);
            refetch();
        } catch (err: any) {
            showMessage('error', err.message);
        }
    };

    const handleDelete = async (userId: string, userName: string) => {
        if (!confirm(`XÓA VĨNH VIỄN tài khoản "${userName}"? Hành động này không thể hoàn tác!`)) return;
        try {
            await deleteUser({ variables: { userId } });
            showMessage('success', `Đã xóa tài khoản ${userName}`);
            refetch();
        } catch (err: any) {
            showMessage('error', err.message);
        }
    };

    const handleRoleChange = async (userId: string, userName: string, newRoleId: string) => {
        const roleName = roles.find((r) => r.roleId === newRoleId)?.roleName;
        if (!confirm(`Đổi vai trò của "${userName}" thành "${roleName}"?`)) return;
        try {
            await updateUserRole({ variables: { userId, roleId: newRoleId } });
            showMessage('success', `Đã đổi vai trò của ${userName} thành ${roleName}`);
            refetch();
        } catch (err: any) {
            showMessage('error', err.message);
        }
    };

    const openCreateModal = () => {
        setFormData({ fullName: '', email: '', password: '', roleId: roles[0]?.roleId || '' });
        setShowCreateModal(true);
    };

    const openEditModal = (user: User) => {
        setEditingUser(user);
        setFormData({
            fullName: user.fullName,
            email: user.email,
            password: '',
            roleId: roles.find((r) => r.roleName === user.roleName)?.roleId || '',
        });
        setShowEditModal(true);
    };

    const handleCreateUser = async () => {
        if (!formData.fullName || !formData.email || !formData.password || !formData.roleId) {
            showMessage('error', 'Vui lòng điền đầy đủ thông tin');
            return;
        }
        try {
            await createUser({ variables: formData });
            showMessage('success', 'Tạo tài khoản thành công');
            setShowCreateModal(false);
            refetch();
        } catch (err: any) {
            showMessage('error', err.message);
        }
    };

    const handleUpdateUser = async () => {
        if (!editingUser) return;
        try {
            await updateUser({
                variables: {
                    userId: editingUser.userId,
                    fullName: formData.fullName || null,
                    email: formData.email || null,
                    password: formData.password || null,
                    roleId: formData.roleId || null,
                },
            });
            showMessage('success', 'Cập nhật thành công');
            setShowEditModal(false);
            setEditingUser(null);
            refetch();
        } catch (err: any) {
            showMessage('error', err.message);
        }
    };

    const formatDate = (dateStr: string) => {
        try {
            return new Date(dateStr).toLocaleDateString('vi-VN');
        } catch {
            return dateStr;
        }
    };

    const getRoleLabel = (roleName: string) => {
        switch (roleName) {
            case 'ADMIN':
                return 'Admin';
            case 'INSTRUCTOR':
                return 'Giảng viên';
            default:
                return 'Học viên';
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                        <Users className="w-7 h-7 text-blue-600" />
                        Quản lý người dùng
                    </h1>
                    <p className="text-gray-500 mt-1">Quản lý tài khoản người dùng trong hệ thống</p>
                </div>
                <button
                    onClick={openCreateModal}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                    <Plus className="w-5 h-5" />
                    Tạo tài khoản
                </button>
            </div>

            {actionMessage && (
                <div
                    className={`p-4 rounded-lg flex items-center gap-2 ${
                        actionMessage.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
                    }`}
                >
                    {actionMessage.type === 'success' ? (
                        <CheckCircle className="w-5 h-5" />
                    ) : (
                        <AlertCircle className="w-5 h-5" />
                    )}
                    {actionMessage.text}
                </div>
            )}

            <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex flex-wrap gap-4 items-center">
                <div className="flex items-center gap-2 flex-1 min-w-0 sm:min-w-[200px]">
                    <Search className="w-5 h-5 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Tìm kiếm theo tên hoặc email..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="flex-1 px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                    />
                </div>

                <div className="flex items-center gap-2">
                    <Filter className="w-5 h-5 text-gray-400" />
                    <select
                        value={roleFilter}
                        onChange={(e) => setRoleFilter(e.target.value)}
                        className="px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                    >
                        <option value="">Tất cả vai trò</option>
                        <option value="ADMIN">Admin</option>
                        <option value="INSTRUCTOR">Giảng viên</option>
                        <option value="STUDENT">Học viên</option>
                    </select>
                </div>
            </div>

            <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
                {loading ? (
                    <div className="flex items-center justify-center py-12">
                        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
                    </div>
                ) : error ? (
                    <div className="p-6 text-red-600">Lỗi: {error.message}</div>
                ) : filteredUsers.length === 0 ? (
                    <div className="text-center py-12 text-gray-500">
                        <Users className="w-12 h-12 mx-auto mb-3 opacity-30" />
                        <p>Không có người dùng nào</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-50 border-b">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">
                                        Người dùng
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">
                                        Vai trò
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">
                                        Trạng thái
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">
                                        Ngày tạo
                                    </th>
                                    <th className="px-6 py-3 text-right text-xs font-semibold text-gray-600 uppercase">
                                        Thao tác
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {filteredUsers.map((user) => (
                                    <tr key={user.userId} className="hover:bg-gray-50">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <UserAvatar
                                                    avatarUrl={user.avatarUrl}
                                                    fullName={user.fullName}
                                                    size="md"
                                                />
                                                <div>
                                                    <p className="font-medium text-gray-800">{user.fullName}</p>
                                                    <p className="text-sm text-gray-500">{user.email}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <select
                                                value={roles.find((r) => r.roleName === user.roleName)?.roleId || ''}
                                                onChange={(e) =>
                                                    handleRoleChange(user.userId, user.fullName, e.target.value)
                                                }
                                                disabled={updatingRole || user.roleName === 'ADMIN'}
                                                className={`px-2 py-1 rounded-lg text-xs font-medium border-0 cursor-pointer disabled:cursor-not-allowed ${
                                                    user.roleName === 'ADMIN'
                                                        ? 'bg-red-100 text-red-700'
                                                        : user.roleName === 'INSTRUCTOR'
                                                        ? 'bg-purple-100 text-purple-700'
                                                        : 'bg-blue-100 text-blue-700'
                                                }`}
                                            >
                                                {roles.map((role) => (
                                                    <option key={role.roleId} value={role.roleId}>
                                                        {getRoleLabel(role.roleName)}
                                                    </option>
                                                ))}
                                            </select>
                                        </td>
                                        <td className="px-6 py-4">
                                            {user.isActive ? (
                                                <span className="px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium">
                                                    Hoạt động
                                                </span>
                                            ) : (
                                                <span className="px-2 py-1 bg-red-100 text-red-700 rounded-full text-xs font-medium">
                                                    Đã khóa
                                                </span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 text-gray-600 text-sm">
                                            {formatDate(user.createdAt)}
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center justify-end gap-2">
                                                <button
                                                    onClick={() => openEditModal(user)}
                                                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                                    title="Sửa"
                                                >
                                                    <Edit className="w-4 h-4" />
                                                </button>
                                                {user.isActive ? (
                                                    <button
                                                        onClick={() => handleLock(user.userId, user.fullName)}
                                                        disabled={locking || user.roleName === 'ADMIN'}
                                                        className="p-2 text-yellow-600 hover:bg-yellow-50 rounded-lg transition-colors disabled:opacity-50"
                                                        title="Khóa"
                                                    >
                                                        <Lock className="w-4 h-4" />
                                                    </button>
                                                ) : (
                                                    <button
                                                        onClick={() => handleUnlock(user.userId, user.fullName)}
                                                        disabled={unlocking}
                                                        className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors disabled:opacity-50"
                                                        title="Mở khóa"
                                                    >
                                                        <Unlock className="w-4 h-4" />
                                                    </button>
                                                )}
                                                <button
                                                    onClick={() => handleDelete(user.userId, user.fullName)}
                                                    disabled={deleting || user.roleName === 'ADMIN'}
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
                )}
            </div>

            {!loading && !error && (
                <div className="text-sm text-gray-500 text-right">
                    Hiển thị {filteredUsers.length} / {users.length} người dùng
                </div>
            )}

            {showCreateModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-xl p-6 w-full max-w-md mx-4">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-xl font-bold text-gray-800">Tạo tài khoản mới</h2>
                            <button
                                onClick={() => setShowCreateModal(false)}
                                className="p-2 hover:bg-gray-100 rounded-lg"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Họ và tên</label>
                                <input
                                    type="text"
                                    value={formData.fullName}
                                    onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                    placeholder="Nguyễn Văn A"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                                <input
                                    type="email"
                                    value={formData.email}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                    placeholder="email@example.com"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Mật khẩu</label>
                                <input
                                    type="password"
                                    value={formData.password}
                                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                    placeholder="••••••••"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Vai trò</label>
                                <select
                                    value={formData.roleId}
                                    onChange={(e) => setFormData({ ...formData, roleId: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                >
                                    {roles.map((role) => (
                                        <option key={role.roleId} value={role.roleId}>
                                            {getRoleLabel(role.roleName)}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>
                        <div className="flex gap-3 mt-6">
                            <button
                                onClick={() => setShowCreateModal(false)}
                                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                            >
                                Hủy
                            </button>
                            <button
                                onClick={handleCreateUser}
                                disabled={creating}
                                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                            >
                                {creating ? <Loader2 className="w-5 h-5 animate-spin mx-auto" /> : 'Tạo'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {showEditModal && editingUser && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-xl p-6 w-full max-w-md mx-4">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-xl font-bold text-gray-800">Sửa thông tin</h2>
                            <button
                                onClick={() => {
                                    setShowEditModal(false);
                                    setEditingUser(null);
                                }}
                                className="p-2 hover:bg-gray-100 rounded-lg"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Họ và tên</label>
                                <input
                                    type="text"
                                    value={formData.fullName}
                                    onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                                <input
                                    type="email"
                                    value={formData.email}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Mật khẩu mới{' '}
                                    <span className="text-gray-400 font-normal">(để trống nếu không đổi)</span>
                                </label>
                                <input
                                    type="password"
                                    value={formData.password}
                                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                    placeholder="••••••••"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Vai trò</label>
                                <select
                                    value={formData.roleId}
                                    onChange={(e) => setFormData({ ...formData, roleId: e.target.value })}
                                    disabled={editingUser.roleName === 'ADMIN'}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none disabled:bg-gray-100"
                                >
                                    {roles.map((role) => (
                                        <option key={role.roleId} value={role.roleId}>
                                            {getRoleLabel(role.roleName)}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>
                        <div className="flex gap-3 mt-6">
                            <button
                                onClick={() => {
                                    setShowEditModal(false);
                                    setEditingUser(null);
                                }}
                                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                            >
                                Hủy
                            </button>
                            <button
                                onClick={handleUpdateUser}
                                disabled={updating}
                                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                            >
                                {updating ? <Loader2 className="w-5 h-5 animate-spin mx-auto" /> : 'Lưu'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
