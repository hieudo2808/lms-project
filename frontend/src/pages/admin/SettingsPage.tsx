import { useEffect, useState } from 'react';
import { useQuery, useMutation } from '@apollo/client';
import { toast } from 'react-toastify';
import { User, Mail, Shield, Settings, Save, Loader2 } from 'lucide-react';

import { GET_ME_QUERY } from '../../graphql/queries/user';
import { UPDATE_PROFILE_MUTATION } from '../../graphql/mutations/user';
import { AvatarUploader } from '../../components/common/AvatarUploader';

export const SettingsPage = () => {
    const { data, loading, error } = useQuery(GET_ME_QUERY, {
        fetchPolicy: 'network-only',
    });

    const [updateProfile, { loading: saving }] = useMutation(UPDATE_PROFILE_MUTATION, {
        refetchQueries: [{ query: GET_ME_QUERY }],
    });

    const [form, setForm] = useState({
        fullName: '',
        bio: '',
        avatarUrl: '',
    });

    useEffect(() => {
        if (data?.me) {
            setForm({
                fullName: data.me.fullName ?? '',
                bio: data.me.bio ?? '',
                avatarUrl: data.me.avatarUrl ?? '',
            });
        }
    }, [data]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setForm((prev) => ({ ...prev, [name]: value }));
    };

    const handleSave = async () => {
        if (!form.fullName.trim()) {
            toast.error('Họ tên không được để trống');
            return;
        }

        try {
            await updateProfile({
                variables: {
                    input: {
                        fullName: form.fullName,
                        bio: form.bio,
                        avatarUrl: form.avatarUrl,
                    },
                },
            });
            toast.success('Cập nhật thông tin thành công');
        } catch (err: any) {
            toast.error(err.message || 'Cập nhật thất bại');
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center py-20">
                <Loader2 className="w-10 h-10 animate-spin text-red-600" />
            </div>
        );
    }

    if (error || !data?.me) {
        return <div className="p-8 text-red-500">Không thể tải thông tin người dùng</div>;
    }

    const me = data.me;

    return (
        <div className="max-w-4xl space-y-8">
            <div>
                <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                    <Settings className="w-6 h-6" /> Cài đặt tài khoản
                </h1>
                <p className="text-gray-500 text-sm">Quản lý thông tin cá nhân và hồ sơ quản trị viên</p>
            </div>

            <div className="bg-white border rounded-xl p-6 flex items-center gap-6">
                <img
                    src={
                        me.avatarUrl ||
                        `https:
                            me.fullName,
                        )}&background=dc2626&color=fff`
                    }
                    alt="avatar"
                    className="w-20 h-20 rounded-full object-cover border-2 border-red-100"
                />

                <div className="space-y-1">
                    <h2 className="text-xl font-bold text-gray-900">{me.fullName}</h2>
                    <p className="text-sm text-gray-600 flex items-center gap-2">
                        <Mail size={14} /> {me.email}
                    </p>
                    <span className="inline-block mt-1 text-xs font-semibold px-3 py-1 rounded-full bg-red-50 text-red-600">
                        {me.roleName}
                    </span>
                </div>
            </div>

            <div className="bg-white border rounded-xl p-6 space-y-5">
                <h2 className="font-semibold flex items-center gap-2 text-gray-800">
                    <User size={18} /> Thông tin cá nhân
                </h2>

                <div>
                    <label className="text-sm font-medium text-gray-700 block mb-2">Ảnh đại diện</label>
                    <AvatarUploader
                        currentUrl={form.avatarUrl}
                        onUploadComplete={(url) => setForm((prev) => ({ ...prev, avatarUrl: url }))}
                        size="md"
                    />
                </div>

                <div>
                    <label className="text-sm font-medium text-gray-700">Họ và tên</label>
                    <input
                        name="fullName"
                        value={form.fullName}
                        onChange={handleChange}
                        className="mt-1 w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-red-500"
                    />
                </div>

                <div>
                    <label className="text-sm font-medium text-gray-700">Giới thiệu</label>
                    <textarea
                        name="bio"
                        value={form.bio}
                        onChange={handleChange}
                        rows={3}
                        className="mt-1 w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-red-500"
                    />
                </div>

                <div className="flex justify-end">
                    <button
                        onClick={handleSave}
                        disabled={saving}
                        className="flex items-center gap-2 px-5 py-2 rounded-lg bg-red-600 text-white font-semibold hover:bg-red-700 disabled:opacity-60 transition"
                    >
                        <Save size={16} />
                        {saving ? 'Đang lưu...' : 'Lưu thay đổi'}
                    </button>
                </div>
            </div>

            <div className="bg-white border rounded-xl p-6 space-y-4">
                <h2 className="font-semibold flex items-center gap-2 text-gray-800">
                    <Shield size={18} /> Thông tin tài khoản
                </h2>

                <div className="flex items-center gap-3 text-sm">
                    <Mail size={16} className="text-gray-400" />
                    <span className="w-24 font-medium">Email</span>
                    <span className="text-gray-700">{me.email}</span>
                </div>

                <div className="flex items-center gap-3 text-sm">
                    <Shield size={16} className="text-gray-400" />
                    <span className="w-24 font-medium">Vai trò</span>
                    <span className="font-semibold text-red-600">{me.roleName}</span>
                </div>
            </div>
        </div>
    );
};
