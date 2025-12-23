import { useEffect, useState } from "react";
import { useQuery, useMutation } from "@apollo/client";
import { toast } from "react-toastify";
import { User, Mail, Calendar, Shield, Save } from "lucide-react";

import { Layout } from "../../components/common/Layout";
import { GET_ME_QUERY } from "../../graphql/queries/user";
import { UPDATE_PROFILE_MUTATION } from "../../graphql/mutations/user";

export default function ProfileSettingsPage() {
  /* ================= QUERY ================= */
  const { data, loading, error } = useQuery(GET_ME_QUERY, {
    fetchPolicy: "network-only",
  });

  /* ================= MUTATION ================= */
  const [updateProfile, { loading: saving }] = useMutation(
    UPDATE_PROFILE_MUTATION,
    {
      refetchQueries: [{ query: GET_ME_QUERY }],
    }
  );

  /* ================= STATE ================= */
  const [form, setForm] = useState({
    fullName: "",
    bio: "",
    avatarUrl: "",
  });

  /* ================= SYNC DATA ================= */
  useEffect(() => {
    if (data?.me) {
      setForm({
        fullName: data.me.fullName ?? "",
        bio: data.me.bio ?? "",
        avatarUrl: data.me.avatarUrl ?? "",
      });
    }
  }, [data]);

  /* ================= HANDLERS ================= */
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    if (!form.fullName.trim()) {
      toast.error("Họ tên không được để trống");
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
      toast.success("Cập nhật thông tin thành công! ✅");
    } catch (err: any) {
      toast.error(err.message || "Cập nhật thất bại");
    }
  };

  /* ================= LOADING & ERROR STATES ================= */
  if (loading) {
    return (
      <Layout>
        <div className="max-w-4xl mx-auto px-4 py-12">
          <div className="text-center text-gray-500">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            Đang tải thông tin tài khoản...
          </div>
        </div>
      </Layout>
    );
  }

  if (error || !data?.me) {
    return (
      <Layout>
        <div className="max-w-4xl mx-auto px-4 py-12">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-red-700">
            ❌ Không thể tải thông tin người dùng
          </div>
        </div>
      </Layout>
    );
  }

  const me = data.me;

  /* ================= UI ================= */
  return (
    <Layout>
      <div className="max-w-4xl mx-auto px-4 py-12 space-y-8">
        {/* ===== HEADER ===== */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-2xl p-8">
          <h1 className="text-3xl font-bold mb-2">⚙️ Cài đặt tài khoản</h1>
          <p className="text-blue-100">
            Quản lý thông tin cá nhân và hồ sơ của bạn
          </p>
        </div>

        {/* ===== PROFILE OVERVIEW CARD ===== */}
        <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <User className="w-5 h-5 text-blue-600" />
            Thông tin cơ bản
          </h2>
          
          <div className="flex items-center gap-6 mb-6 pb-6 border-b border-gray-200">
            <img
              src={
                me.avatarUrl ||
                `https://ui-avatars.com/api/?name=${encodeURIComponent(
                  me.fullName
                )}&background=6366f1&color=fff&size=128`
              }
              alt={me.fullName}
              className="w-20 h-20 rounded-full object-cover border-4 border-blue-100"
            />
            <div className="flex-1">
              <h3 className="text-xl font-bold text-gray-900">{me.fullName}</h3>
              <div className="flex items-center gap-2 text-gray-600 mt-1">
                <Mail className="w-4 h-4" />
                <span className="text-sm">{me.email}</span>
              </div>
              <div className="flex items-center gap-4 mt-2">
                <div className="flex items-center gap-1 text-xs text-gray-500">
                  <Shield className="w-4 h-4" />
                  <span className="font-medium uppercase">{me.roleName}</span>
                </div>
                <div className="flex items-center gap-1 text-xs text-gray-500">
                  <Calendar className="w-4 h-4" />
                  <span>
                    Tham gia {new Date(me.createdAt).toLocaleDateString("vi-VN")}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* ===== EDIT FORM ===== */}
          <div className="space-y-6">
            {/* Họ và tên */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Họ và tên <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="fullName"
                value={form.fullName}
                onChange={handleChange}
                placeholder="Nhập họ và tên của bạn"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              />
            </div>

            {/* Bio / Giới thiệu */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Giới thiệu bản thân
              </label>
              <textarea
                name="bio"
                value={form.bio}
                onChange={handleChange}
                rows={4}
                placeholder="Viết vài dòng giới thiệu về bản thân..."
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none"
              />
              <p className="text-xs text-gray-500 mt-1">
                Tối đa 500 ký tự
              </p>
            </div>

            {/* Avatar URL */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                URL Ảnh đại diện
              </label>
              <input
                type="url"
                name="avatarUrl"
                value={form.avatarUrl}
                onChange={handleChange}
                placeholder="https://example.com/avatar.jpg"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              />
              <p className="text-xs text-gray-500 mt-1">
                Nhập URL của ảnh đại diện (để trống nếu dùng avatar mặc định)
              </p>
            </div>

            {/* Preview Avatar */}
            {form.avatarUrl && (
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-sm font-semibold text-gray-700 mb-3">
                  Xem trước ảnh đại diện:
                </p>
                <img
                  src={form.avatarUrl}
                  alt="Avatar preview"
                  className="w-24 h-24 rounded-full object-cover border-4 border-white shadow-md"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${encodeURIComponent(
                      form.fullName || "User"
                    )}&background=6366f1&color=fff&size=128`;
                  }}
                />
              </div>
            )}

            {/* Save Button */}
            <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-200">
              <button
                onClick={handleSave}
                disabled={saving}
                className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-lg hover:shadow-lg hover:scale-105 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
              >
                {saving ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    <span>Đang lưu...</span>
                  </>
                ) : (
                  <>
                    <Save className="w-5 h-5" />
                    <span>Lưu thay đổi</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* ===== ACCOUNT INFO (READ-ONLY) ===== */}
        <div className="bg-gray-50 border border-gray-200 rounded-2xl p-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <Shield className="w-5 h-5 text-gray-600" />
            Thông tin tài khoản
          </h2>
          
          <div className="space-y-3">
            <div className="flex justify-between items-center py-2">
              <span className="text-sm text-gray-600">Email:</span>
              <span className="text-sm font-medium text-gray-900">{me.email}</span>
            </div>
            <div className="flex justify-between items-center py-2">
              <span className="text-sm text-gray-600">Vai trò:</span>
              <span className="text-sm font-medium text-gray-900 uppercase">
                {me.roleName}
              </span>
            </div>
            <div className="flex justify-between items-center py-2">
              <span className="text-sm text-gray-600">Trạng thái:</span>
              <span className={`text-sm font-medium ${me.isActive ? 'text-green-600' : 'text-red-600'}`}>
                {me.isActive ? '✅ Đang hoạt động' : '❌ Bị khóa'}
              </span>
            </div>
            <div className="flex justify-between items-center py-2">
              <span className="text-sm text-gray-600">Ngày tham gia:</span>
              <span className="text-sm font-medium text-gray-900">
                {new Date(me.createdAt).toLocaleDateString("vi-VN", {
                  year: "numeric",
                  month: "long",
                  day: "numeric"
                })}
              </span>
            </div>
          </div>

          <div className="mt-4 pt-4 border-t border-gray-300">
            <p className="text-xs text-gray-500 italic">
              ℹ️ Để thay đổi email hoặc mật khẩu, vui lòng liên hệ quản trị viên.
            </p>
          </div>
        </div>
      </div>
    </Layout>
  );
}
