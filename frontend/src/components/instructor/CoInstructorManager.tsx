import { useState } from 'react';
import { useMutation } from '@apollo/client';
import { Users, Plus, X, Loader2, UserPlus, Trash2 } from 'lucide-react';
import { toast } from 'react-toastify';
import { ADD_CO_INSTRUCTOR, REMOVE_CO_INSTRUCTOR } from '../../graphql/mutations/coInstructor';

interface CoInstructor {
    userId: string;
    fullName: string;
    email: string;
    avatarUrl?: string;
    role: string;
    addedAt: string;
}

interface Props {
    courseId: string;
    coInstructors: CoInstructor[];
    isOwner: boolean;
    refetch: () => void;
}

export const CoInstructorManager = ({ courseId, coInstructors, isOwner, refetch }: Props) => {
    const [showAddForm, setShowAddForm] = useState(false);
    const [email, setEmail] = useState('');

    const [addCoInstructor, { loading: adding }] = useMutation(ADD_CO_INSTRUCTOR);
    const [removeCoInstructor, { loading: removing }] = useMutation(REMOVE_CO_INSTRUCTOR);

    const handleAdd = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!email.trim()) return;

        try {
            await addCoInstructor({
                variables: { courseId, email: email.trim() },
            });
            toast.success('Đã thêm giảng viên phụ!');
            setEmail('');
            setShowAddForm(false);
            refetch();
        } catch (err: any) {
            toast.error(err.message || 'Không thể thêm giảng viên');
        }
    };

    const handleRemove = async (userId: string, name: string) => {
        if (!confirm(`Xóa ${name} khỏi khóa học?`)) return;

        try {
            await removeCoInstructor({
                variables: { courseId, userId },
            });
            toast.success('Đã xóa giảng viên!');
            refetch();
        } catch (err: any) {
            toast.error(err.message || 'Không thể xóa giảng viên');
        }
    };

    return (
        <div className="bg-white border rounded-xl p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold flex items-center gap-2">
                    <Users size={20} className="text-indigo-600" />
                    Giảng viên ({coInstructors.length})
                </h2>
                {isOwner && !showAddForm && (
                    <button
                        onClick={() => setShowAddForm(true)}
                        className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors text-sm font-medium"
                    >
                        <UserPlus size={18} />
                        Thêm giảng viên
                    </button>
                )}
            </div>

            {/* Add Form */}
            {showAddForm && (
                <form onSubmit={handleAdd} className="mb-4 p-4 bg-indigo-50 rounded-lg">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Email giảng viên</label>
                    <div className="flex gap-2">
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="instructor@example.com"
                            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                            required
                        />
                        <button
                            type="submit"
                            disabled={adding}
                            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 flex items-center gap-2"
                        >
                            {adding ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                            Thêm
                        </button>
                        <button
                            type="button"
                            onClick={() => {
                                setShowAddForm(false);
                                setEmail('');
                            }}
                            className="px-3 py-2 text-gray-500 hover:bg-gray-100 rounded-lg"
                        >
                            <X className="w-4 h-4" />
                        </button>
                    </div>
                </form>
            )}

            {/* Instructor List */}
            <div className="space-y-3">
                {coInstructors.map((ci) => (
                    <div key={ci.userId} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center gap-3">
                            {ci.avatarUrl ? (
                                <img
                                    src={ci.avatarUrl}
                                    alt={ci.fullName}
                                    className="w-10 h-10 rounded-full object-cover"
                                />
                            ) : (
                                <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-semibold">
                                    {ci.fullName.charAt(0).toUpperCase()}
                                </div>
                            )}
                            <div>
                                <p className="font-medium text-gray-800">{ci.fullName}</p>
                                <p className="text-sm text-gray-500">{ci.email}</p>
                            </div>
                            <span
                                className={`px-2 py-0.5 text-xs font-medium rounded-full ${
                                    ci.role === 'OWNER' ? 'bg-yellow-100 text-yellow-700' : 'bg-blue-100 text-blue-700'
                                }`}
                            >
                                {ci.role === 'OWNER' ? 'Chủ khóa học' : 'Giảng viên phụ'}
                            </span>
                        </div>

                        {isOwner && ci.role !== 'OWNER' && (
                            <button
                                onClick={() => handleRemove(ci.userId, ci.fullName)}
                                disabled={removing}
                                className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                title="Xóa"
                            >
                                <Trash2 className="w-4 h-4" />
                            </button>
                        )}
                    </div>
                ))}

                {coInstructors.length === 0 && (
                    <div className="text-center py-6 text-gray-500 text-sm">Chưa có giảng viên phụ nào</div>
                )}
            </div>
        </div>
    );
};
