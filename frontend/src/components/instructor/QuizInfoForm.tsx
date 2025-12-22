import { useState } from 'react';

export const QuizInfoForm = ({
  onSubmit,
  submitLabel = 'Tạo quiz',
}: any) => {
  const [form, setForm] = useState({
    title: '',
    description: '',
    duration: 30,
    passingScore: 70,
  });

  return (
    <div className="space-y-4 bg-white p-6 rounded-xl border">
      <input
        placeholder="Tiêu đề quiz"
        className="input"
        value={form.title}
        onChange={(e) => setForm({ ...form, title: e.target.value })}
      />

      <textarea
        placeholder="Mô tả"
        className="input"
        value={form.description}
        onChange={(e) =>
          setForm({ ...form, description: e.target.value })
        }
      />

      <div className="flex gap-4">
        <input
          type="number"
          className="input"
          placeholder="Thời gian (phút)"
          value={form.duration}
          onChange={(e) =>
            setForm({ ...form, duration: +e.target.value })
          }
        />
        <input
          type="number"
          className="input"
          placeholder="Điểm đạt (%)"
          value={form.passingScore}
          onChange={(e) =>
            setForm({ ...form, passingScore: +e.target.value })
          }
        />
      </div>

      <button className="btn-primary" onClick={() => onSubmit(form)}>
        {submitLabel}
      </button>
    </div>
  );
};
