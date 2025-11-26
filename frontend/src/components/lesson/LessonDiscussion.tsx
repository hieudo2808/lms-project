import { useEffect, useState } from 'react';
import { commentAPI } from '../../services/api';
import type { LessonComment } from '../../types';
import { useAuthStore } from '../../lib/store';

interface LessonDiscussionProps {
  lessonId: string;
}

export const LessonDiscussion = ({ lessonId }: LessonDiscussionProps) => {
  const { auth } = useAuthStore();

  const [comments, setComments] = useState<LessonComment[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [newContent, setNewContent] = useState('');
  const [replyContent, setReplyContent] = useState('');
  const [replyToId, setReplyToId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!lessonId) return;

    const fetchComments = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // TODO: dùng API thật
        // const res = await commentAPI.getLessonComments(lessonId);
        // setComments(res.data);

        const mock: LessonComment[] = [
          {
            id: 'c1',
            lessonId,
            userId: 'u1',
            userName: 'Nguyễn Văn B',
            userAvatarUrl: undefined,
            content: 'Bài này rất dễ hiểu, cảm ơn thầy.',
            createdAt: new Date().toISOString(),
            parentId: null,
          },
          {
            id: 'c2',
            lessonId,
            userId: 'u2',
            userName: 'Trần Thị C',
            userAvatarUrl: undefined,
            content: 'Em đồng ý, ví dụ minh họa rất rõ.',
            createdAt: new Date().toISOString(),
            parentId: 'c1',
          },
        ];
        setComments(mock);
      } catch (err) {
        console.error(err);
        setError('Không tải được bình luận.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchComments();
  }, [lessonId]);

  const createLocalComment = (content: string, parentId?: string | null) => {
    const c: LessonComment = {
      id: crypto.randomUUID?.() || Date.now().toString(),
      lessonId,
      userId: auth?.user.id || 'me',
      userName: auth?.user.fullName || 'Bạn',
      userAvatarUrl: auth?.user.avatarUrl,
      content: content.trim(),
      createdAt: new Date().toISOString(),
      parentId: parentId ?? null,
    };
    setComments((prev) => [c, ...prev]);
  };

  const handleSubmitNew = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newContent.trim()) {
      setError('Vui lòng nhập nội dung bình luận.');
      return;
    }

    try {
      setIsSubmitting(true);
      setError(null);

      // TODO: gọi API thật
      // await commentAPI.createComment(lessonId, newContent);

      createLocalComment(newContent, null);
      setNewContent('');
    } catch (err) {
      console.error(err);
      setError('Gửi bình luận thất bại.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmitReply = async (parentId: string) => {
    if (!replyContent.trim()) {
      setError('Vui lòng nhập nội dung trả lời.');
      return;
    }

    try {
      setIsSubmitting(true);
      setError(null);

      // TODO: gọi API thật
      // await commentAPI.createComment(lessonId, replyContent, parentId);

      createLocalComment(replyContent, parentId);
      setReplyContent('');
      setReplyToId(null);
    } catch (err) {
      console.error(err);
      setError('Gửi trả lời thất bại.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const roots = comments.filter((c) => !c.parentId);
  const repliesMap = comments.reduce<Record<string, LessonComment[]>>(
    (acc, c) => {
      if (c.parentId) {
        if (!acc[c.parentId]) acc[c.parentId] = [];
        acc[c.parentId].push(c);
      }
      return acc;
    },
    {}
  );

  return (
    <div className="mt-10">
      <h2 className="text-xl font-bold text-gray-800 mb-4">
        💬 Thảo luận bài học
      </h2>

      <div className="mb-6 p-4 bg-white border border-gray-200 rounded-lg">
        {error && <p className="text-sm text-red-600 mb-2">{error}</p>}
        <form onSubmit={handleSubmitNew} className="space-y-3">
          <textarea
            value={newContent}
            onChange={(e) => setNewContent(e.target.value)}
            rows={3}
            placeholder="Đặt câu hỏi hoặc chia sẻ cảm nhận của bạn..."
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-4 py-2 rounded-lg bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 disabled:opacity-60"
          >
            {isSubmitting ? 'Đang gửi...' : 'Gửi bình luận'}
          </button>
        </form>
      </div>

      {isLoading && <p className="text-sm text-gray-500">Đang tải bình luận...</p>}

      {!isLoading && roots.length === 0 && (
        <p className="text-sm text-gray-500">
          Chưa có bình luận nào. Hãy là người đầu tiên!
        </p>
      )}

      <div className="space-y-4">
        {roots.map((cmt) => (
          <div
            key={cmt.id}
            className="p-3 bg-white rounded-lg border border-gray-200"
          >
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white text-xs font-bold">
                {cmt.userName[0]}
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <p className="font-semibold text-sm text-gray-800">
                    {cmt.userName}
                  </p>
                  <p className="text-xs text-gray-500">
                    {new Date(cmt.createdAt).toLocaleString()}
                  </p>
                </div>
                <p className="text-sm text-gray-700 mt-1">{cmt.content}</p>

                <button
                  type="button"
                  onClick={() =>
                    setReplyToId((prev) => (prev === cmt.id ? null : cmt.id))
                  }
                  className="mt-2 text-xs text-blue-600 font-semibold hover:underline"
                >
                  Trả lời
                </button>

                {replyToId === cmt.id && (
                  <div className="mt-3 space-y-2">
                    <textarea
                      value={replyContent}
                      onChange={(e) => setReplyContent(e.target.value)}
                      rows={2}
                      placeholder={`Trả lời ${cmt.userName}...`}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-xs focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => handleSubmitReply(cmt.id)}
                        disabled={isSubmitting}
                        className="px-3 py-1 rounded-lg bg-blue-600 text-white text-xs font-semibold hover:bg-blue-700 disabled:opacity-60"
                      >
                        Gửi
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setReplyToId(null);
                          setReplyContent('');
                        }}
                        className="px-3 py-1 rounded-lg bg-gray-200 text-gray-700 text-xs font-semibold hover:bg-gray-300"
                      >
                        Hủy
                      </button>
                    </div>
                  </div>
                )}

                {/* replies */}
                {repliesMap[cmt.id]?.length ? (
                  <div className="mt-3 space-y-2 border-l border-gray-200 pl-3">
                    {repliesMap[cmt.id].map((rep) => (
                      <div key={rep.id} className="text-sm">
                        <div className="flex items-center justify-between">
                          <p className="font-semibold text-gray-800">
                            {rep.userName}
                          </p>
                          <p className="text-xs text-gray-400">
                            {new Date(rep.createdAt).toLocaleString()}
                          </p>
                        </div>
                        <p className="text-gray-700 text-sm mt-1">
                          {rep.content}
                        </p>
                      </div>
                    ))}
                  </div>
                ) : null}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
