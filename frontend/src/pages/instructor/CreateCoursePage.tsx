import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation, useQuery } from '@apollo/client';
import { toast } from 'react-toastify';
import { 
  BookPlus, Type, ArrowRight, Loader2, 
  DollarSign, BarChart, Tag, AlertCircle 
} from 'lucide-react';

// Import Query & Mutation
import { CREATE_COURSE_MUTATION } from '../../graphql/mutations/instructor';
import { GET_ALL_CATEGORIES_QUERY } from '../../graphql/queries/category';

// Các tùy chọn Level 
const LEVELS = [
  { value: 'Beginner', label: 'Cơ bản (Beginner)' },
  { value: 'Intermediate', label: 'Trung bình (Intermediate)' },
  { value: 'Advanced', label: 'Nâng cao (Advanced)' },
  { value: 'All_Levels', label: 'Tất cả trình độ' }
];

export const CreateCoursePage = () => {
  const navigate = useNavigate();
  
  // 1. Fetch Danh mục từ Backend
  const { data: categoryData, loading: loadingCategories, error: categoryError } = useQuery(GET_ALL_CATEGORIES_QUERY);

  // State quản lý Form
  const [formData, setFormData] = useState({
    title: '',
    price: 0,
    level: 'BEGINNER',
    categoryId: '' // Sẽ được set khi chọn từ list
  });

  const [createCourse, { loading: creating }] = useMutation(CREATE_COURSE_MUTATION);

  // Tự động chọn danh mục đầu tiên khi tải xong (để UX tốt hơn)
  useEffect(() => {
    if (categoryData?.getAllCategories?.length > 0 && !formData.categoryId) {
        setFormData(prev => ({ ...prev, categoryId: categoryData.getAllCategories[0].categoryId }));
    }
  }, [categoryData]);

  // Xử lý thay đổi input
  const handleChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate cơ bản
    if (!formData.title.trim()) {
        toast.warning("Vui lòng nhập tên khóa học!");
        return;
    }
    if (!formData.categoryId) {
        toast.warning("Vui lòng chọn danh mục khóa học!");
        return;
    }

    try {
      // 1. Tạo Slug tự động (Logic cũ vẫn tốt)
      const slug = formData.title.toLowerCase()
        .replace(/à|á|ạ|ả|ã|â|ầ|ấ|ậ|ẩ|ẫ|ă|ằ|ắ|ặ|ẳ|ẵ/g, "a")
        .replace(/è|é|ẹ|ẻ|ẽ|ê|ề|ế|ệ|ể|ễ/g, "e")
        .replace(/ì|í|ị|ỉ|ĩ/g, "i")
        .replace(/ò|ó|ọ|ỏ|õ|ô|ồ|ố|ộ|ổ|ỗ|ơ|ờ|ớ|ợ|ở|ỡ/g, "o")
        .replace(/ù|ú|ụ|ủ|ũ|ư|ừ|ứ|ự|ử|ữ/g, "u")
        .replace(/ỳ|ý|ỵ|ỷ|ỹ/g, "y")
        .replace(/đ/g, "d")
        .replace(/ /g, '-')
        .replace(/[^\w-]+/g, '');

      // 2. Gọi API Mutation
      const { data } = await createCourse({
        variables: {
          input: {
            title: formData.title,
            slug: slug, 
            price: Number(formData.price),
            level: formData.level,
            categoryId: formData.categoryId // Dữ liệu thật từ Backend
          }
        }
      });

      // 3. Thành công -> Chuyển sang trang Edit
      if (data?.createCourse) {
        toast.success("Khởi tạo khóa học thành công!");
        navigate(`/instructor/courses/${data.createCourse.slug}/edit`);
      }
    } catch (error: any) {
      console.error(error);
      toast.error('Lỗi: ' + (error.message || "Không thể tạo khóa học"));
    }
  };

  // Nếu đang tải danh mục
  if (loadingCategories) return (
    <div className="flex justify-center items-center h-[80vh]">
        <div className="flex flex-col items-center gap-2">
            <Loader2 className="animate-spin text-blue-600" size={32} />
            <p className="text-gray-500 font-medium">Đang tải dữ liệu hệ thống...</p>
        </div>
    </div>
  );

  // Nếu lỗi tải danh mục (Rất quan trọng, không được bỏ qua)
  if (categoryError) return (
    <div className="flex justify-center items-center h-[80vh]">
        <div className="text-center max-w-md p-6 bg-red-50 rounded-xl border border-red-100">
            <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-3" />
            <h3 className="text-lg font-bold text-gray-800">Không thể tải danh mục</h3>
            <p className="text-gray-600 mt-2 mb-4">{categoryError.message}</p>
            <button onClick={() => window.location.reload()} className="px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 font-medium">
                Thử lại
            </button>
        </div>
    </div>
  );

  const categories = categoryData?.getAllCategories || [];

  return (
    <div className="max-w-4xl mx-auto py-12 px-4">
        {/* Header */}
        <div className="text-center mb-10">
            <div className="bg-blue-100 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 text-blue-600 shadow-sm">
                <BookPlus size={32} />
            </div>
            <h1 className="text-3xl font-bold text-gray-900">Thiết lập khóa học mới</h1>
            <p className="text-gray-500 mt-2 max-w-lg mx-auto">
                Nhập thông tin chính xác để hệ thống phân loại khóa học của bạn đúng cách.
            </p>
        </div>

        {/* Form */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8 md:p-10">
            <form onSubmit={handleCreate} className="space-y-8">
                
                {/* 1. Tên khóa học */}
                <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2 flex items-center gap-2">
                        <Type size={18} className="text-blue-500" /> Tên khóa học <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                        <input
                            type="text"
                            autoFocus
                            className="block w-full px-4 py-3 text-lg border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all placeholder-gray-300"
                            placeholder="Ví dụ: Lập trình Java từ con số 0..."
                            value={formData.title}
                            onChange={(e) => handleChange('title', e.target.value)}
                            maxLength={100}
                        />
                        <div className="absolute right-4 top-1/2 -translate-y-1/2 text-xs text-gray-400 font-medium bg-white px-1">
                            {formData.title.length}/100
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* 2. Giá khóa học */}
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2 flex items-center gap-2">
                            <DollarSign size={18} className="text-green-500" /> Giá bán (VND)
                        </label>
                        <div className="relative">
                            <input
                                type="number"
                                min="0"
                                step="1000"
                                className="block w-full pl-4 pr-12 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition-all font-medium"
                                placeholder="0"
                                value={formData.price}
                                onChange={(e) => handleChange('price', e.target.value)}
                            />
                            <div className="absolute right-4 top-1/2 -translate-y-1/2 text-sm text-gray-500 font-bold">
                                đ
                            </div>
                        </div>
                        <p className="mt-2 text-xs text-gray-500 italic">
                            * Để 0 nếu là khóa học miễn phí.
                        </p>
                    </div>

                    {/* 3. Trình độ */}
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2 flex items-center gap-2">
                            <BarChart size={18} className="text-purple-500" /> Trình độ
                        </label>
                        <select
                            className="block w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none transition-all bg-white cursor-pointer hover:border-purple-300"
                            value={formData.level}
                            onChange={(e) => handleChange('level', e.target.value)}
                        >
                            {LEVELS.map(lvl => (
                                <option key={lvl.value} value={lvl.value}>{lvl.label}</option>
                            ))}
                        </select>
                    </div>
                </div>

                {/* 4. Danh mục (Dynamic Data from Backend) */}
                <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2 flex items-center gap-2">
                        <Tag size={18} className="text-orange-500" /> Danh mục <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                        <select
                            className="block w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition-all bg-white cursor-pointer hover:border-orange-300 appearance-none"
                            value={formData.categoryId}
                            onChange={(e) => handleChange('categoryId', e.target.value)}
                        >
                            {categories.map((cat: any) => (
                                <option key={cat.categoryId} value={cat.categoryId}>
                                    {cat.name}
                                </option>
                            ))}
                        </select>
                        {/* Icon mũi tên tùy chỉnh cho đẹp */}
                        <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-500">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                        </div>
                    </div>
                    {categories.length === 0 && (
                        <p className="mt-2 text-sm text-red-500 flex items-center gap-1">
                            <AlertCircle size={14}/> Hệ thống chưa có danh mục nào. Vui lòng liên hệ Admin.
                        </p>
                    )}
                </div>
                
                {/* Action Buttons */}
                <div className="flex items-center justify-between pt-6 border-t border-gray-100">
                    <button 
                        type="button" 
                        onClick={() => navigate('/instructor/my-courses')}
                        className="px-6 py-2.5 text-gray-600 font-medium hover:bg-gray-100 rounded-lg transition-colors"
                    >
                        Quay lại
                    </button>

                    <button 
                        type="submit" 
                        disabled={!formData.title.trim() || creating || !formData.categoryId}
                        className={`
                            flex items-center gap-2 px-8 py-3 rounded-xl font-bold text-white shadow-lg shadow-blue-200 transition-all transform active:scale-95
                            ${(!formData.title.trim() || creating || !formData.categoryId) 
                                ? 'bg-blue-300 cursor-not-allowed shadow-none' 
                                : 'bg-blue-600 hover:bg-blue-700 hover:shadow-blue-300'}
                        `}
                    >
                        {creating ? (
                            <>
                                <Loader2 className="animate-spin" size={20} /> Đang xử lý...
                            </>
                        ) : (
                            <>
                                Tiếp tục & Biên soạn <ArrowRight size={20} />
                            </>
                        )}
                    </button>
                </div>
            </form>
        </div>
    </div>
  );
};