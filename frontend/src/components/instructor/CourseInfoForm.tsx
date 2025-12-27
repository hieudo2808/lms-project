import { useState } from "react";
import { useMutation } from "@apollo/client";
import { UPDATE_COURSE_MUTATION } from "../../graphql/mutations/instructor";
import { toast } from "react-toastify";

interface CourseInfoFormProps {
  course: {
    courseId: string;
    title: string;
    description?: string;
    price?: number;
    level?: string;
    thumbnailUrl?: string;
  };
}

export default function CourseInfoForm({ course }: CourseInfoFormProps) {
  const [form, setForm] = useState({
    title: course.title || "",
    description: course.description || "",
    price: course.price || 0,
    level: course.level || "BEGINNER",
    thumbnailUrl: course.thumbnailUrl || "",
  });

  const [updateCourse, { loading }] = useMutation(UPDATE_COURSE_MUTATION);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async () => {
    try {
      await updateCourse({
        variables: {
          courseId: course.courseId,
          input: {
            title: form.title,
            description: form.description,
            price: Number(form.price),
            level: form.level,
            thumbnailUrl: form.thumbnailUrl,
          },
        },
      });

      toast.success("Cập nhật thông tin khóa học thành công");
    } catch (err: any) {
      toast.error(err.message || "Cập nhật thất bại");
    }
  };

  return (
    <div className="bg-white rounded-xl border p-4 sm:p-6 space-y-4">
      <h2 className="text-base sm:text-lg font-semibold text-gray-800">Thông tin khóa học</h2>

      {/* Thumbnail */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Ảnh thumbnail</label>
        <input
          type="text"
          name="thumbnailUrl"
          value={form.thumbnailUrl}
          onChange={handleChange}
          placeholder="Dán URL ảnh (S3, Cloudinary...)"
          className="w-full border rounded px-3 py-2 text-sm"
        />
        {form.thumbnailUrl && (
          <img
            src={form.thumbnailUrl}
            alt="thumbnail"
            className="mt-2 h-24 sm:h-32 rounded object-cover"
          />
        )}
      </div>

      {/* Title */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Tên khóa học</label>
        <input
          type="text"
          name="title"
          value={form.title}
          onChange={handleChange}
          className="w-full border rounded px-3 py-2 text-sm"
        />
      </div>

      {/* Description */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Mô tả</label>
        <textarea
          name="description"
          value={form.description}
          onChange={handleChange}
          rows={4}
          className="w-full border rounded px-3 py-2 text-sm"
        />
      </div>

      {/* Price + Level */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Giá</label>
          <input
            type="number"
            name="price"
            value={form.price}
            onChange={handleChange}
            className="w-full border rounded px-3 py-2 text-sm"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Trình độ</label>
          <select
            name="level"
            value={form.level}
            onChange={handleChange}
            className="w-full border rounded px-3 py-2 text-sm"
          >
            <option value="BEGINNER">Cơ bản</option>
            <option value="INTERMEDIATE">Trung cấp</option>
            <option value="ADVANCED">Nâng cao</option>
          </select>
        </div>
      </div>

      <div className="flex justify-end">
        <button
          onClick={handleSubmit}
          disabled={loading}
          className="w-full sm:w-auto px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm font-medium"
        >
          Lưu thay đổi
        </button>
      </div>
    </div>
  );
}
