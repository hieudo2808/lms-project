import { useEffect, useState } from 'react';
import { lessonAPI } from '../../services/api';
import type { LessonResource } from '../../types';

interface LessonResourcesProps {
  lessonId: string;
}

const getIcon = (type: string) => {
  const t = type.toUpperCase();
  if (t === 'PDF') return '📕';
  if (t === 'DOC' || t === 'DOCX') return '📄';
  if (t === 'ZIP' || t === 'RAR') return '🗂️';
  return '📎';
};

export const LessonResources = ({ lessonId }: LessonResourcesProps) => {
  const [resources, setResources] = useState<LessonResource[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!lessonId) return;

    const fetchResources = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // TODO: dùng API thật
        // const res = await lessonAPI.getResources(lessonId);
        // setResources(res.data);

        //mock
        const mock: LessonResource[] = [
          {
            id: 'r1',
            lessonId,
            resourceUrl: '#',
            resourceType: 'PDF',
          },
          {
            id: 'r2',
            lessonId,
            resourceUrl: '#',
            resourceType: 'ZIP',
          },
        ];
        setResources(mock);
      } catch (err) {
        console.error(err);
        setError('Không tải được tài liệu.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchResources();
  }, [lessonId]);

  if (isLoading) {
    return (
      <div className="mt-8 p-4 border rounded-lg bg-white">
        <p className="text-sm text-gray-500">Đang tải tài liệu...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="mt-8 p-4 border rounded-lg bg-white">
        <p className="text-sm text-red-600">{error}</p>
      </div>
    );
  }

  if (resources.length === 0) {
    return null;
  }

  return (
    <div className="mt-8 p-4 border rounded-lg bg-white">
      <h2 className="text-lg font-semibold text-gray-800 mb-3">
        📎 Tài liệu đính kèm
      </h2>
      <ul className="space-y-2">
        {resources.map((r) => (
          <li key={r.id}>
            <a
              href={r.resourceUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-between px-3 py-2 rounded-lg hover:bg-gray-50 border border-gray-100"
            >
              <div className="flex items-center gap-3">
                <span className="text-xl">{getIcon(r.resourceType)}</span>
                <span className="text-sm text-gray-800">
                  {r.resourceType} tài liệu
                </span>
              </div>
              <span className="text-xs text-blue-600 font-semibold">
                Tải xuống
              </span>
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
};
