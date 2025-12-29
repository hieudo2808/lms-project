import { formatShortDate } from '../../utils';

interface Comment {
    commentId: string;
    content: string;
    createdAt: string;
    user?: {
        fullName: string;
        avatarUrl?: string;
    };
    replies?: Comment[];
}

interface Lesson {
    lessonId: string;
    title: string;
}

interface CourseDiscussionProps {
    lessons: Lesson[];
    selectedLessonId: string | null;
    onSelectLesson: (lessonId: string) => void;
    comments: Comment[];
    commentsLoading: boolean;
    isPreviewMode: boolean;
    commentText: string;
    onCommentTextChange: (text: string) => void;
    onAddComment: () => void;
    isCommentSubmitting: boolean;
    replyingToId: string | null;
    replyText: string;
    onReplyTextChange: (text: string) => void;
    onSetReplyingTo: (id: string | null) => void;
    onAddReply: (parentId: string) => void;
}

export const CourseDiscussion = ({
    lessons,
    selectedLessonId,
    onSelectLesson,
    comments,
    commentsLoading,
    isPreviewMode,
    commentText,
    onCommentTextChange,
    onAddComment,
    isCommentSubmitting,
    replyingToId,
    replyText,
    onReplyTextChange,
    onSetReplyingTo,
    onAddReply,
}: CourseDiscussionProps) => {
    const selectedLesson = lessons.find((l) => l.lessonId === selectedLessonId);

    return (
        <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm space-y-6">
            <div className="flex items-center justify-between gap-4 flex-wrap">
                <div>
                    <h2 className="text-2xl font-bold text-gray-900">Thảo luận bài học</h2>
                    <p className="text-sm text-gray-500">Chọn bài học để xem và tạo bình luận.</p>
                </div>
                <select
                    value={selectedLessonId || ''}
                    onChange={(e) => onSelectLesson(e.target.value)}
                    className="border border-gray-300 rounded-lg px-3 py-2 text-sm"
                >
                    <option value="" disabled>
                        Chọn bài học
                    </option>
                    {lessons.map((lesson) => (
                        <option key={lesson.lessonId} value={lesson.lessonId}>
                            {lesson.title}
                        </option>
                    ))}
                </select>
            </div>

            {!selectedLesson && <p className="text-gray-500">Hãy chọn một bài học để xem thảo luận.</p>}

            {selectedLesson && (
                <div className="space-y-4">
                    {!isPreviewMode && (
                        <div className="flex gap-3">
                            <textarea
                                value={commentText}
                                onChange={(e) => onCommentTextChange(e.target.value)}
                                placeholder="Chia sẻ thắc mắc của bạn..."
                                className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                rows={3}
                            />
                            <button
                                onClick={onAddComment}
                                disabled={isCommentSubmitting || !commentText.trim()}
                                className="h-fit bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-blue-700 disabled:opacity-60"
                            >
                                {isCommentSubmitting ? 'Đang gửi...' : 'Gửi'}
                            </button>
                        </div>
                    )}
                    {isPreviewMode && (
                        <p className="text-amber-600 text-sm italic">👁️ Chế độ xem trước - Không thể bình luận</p>
                    )}

                    {commentsLoading && <p className="text-gray-500">Đang tải bình luận...</p>}
                    {!commentsLoading && comments.length === 0 && (
                        <p className="text-gray-500">Chưa có bình luận. Hãy là người đầu tiên!</p>
                    )}

                    <div className="space-y-4">
                        {comments.map((comment) => (
                            <div key={comment.commentId} className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                                <div className="flex items-center gap-3 mb-2">
                                    <img
                                        src={comment.user?.avatarUrl || 'https://via.placeholder.com/40'}
                                        alt={comment.user?.fullName}
                                        className="w-10 h-10 rounded-full object-cover"
                                    />
                                    <div>
                                        <div className="font-semibold text-gray-800">{comment.user?.fullName}</div>
                                        <div className="text-xs text-gray-500">
                                            {formatShortDate(comment.createdAt)}
                                        </div>
                                    </div>
                                </div>
                                <p className="text-gray-700 text-sm mb-2">{comment.content}</p>

                                <button
                                    onClick={() =>
                                        onSetReplyingTo(replyingToId === comment.commentId ? null : comment.commentId)
                                    }
                                    className="text-xs text-blue-600 hover:text-blue-700 font-medium"
                                >
                                    {replyingToId === comment.commentId ? 'Hủy' : 'Trả lời'}
                                </button>

                                {replyingToId === comment.commentId && (
                                    <div className="mt-3 flex gap-2">
                                        <input
                                            type="text"
                                            placeholder="Viết câu trả lời..."
                                            value={replyText}
                                            onChange={(e) => onReplyTextChange(e.target.value)}
                                            className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        />
                                        <button
                                            onClick={() => onAddReply(comment.commentId)}
                                            disabled={!replyText.trim()}
                                            className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-blue-700 disabled:opacity-60"
                                        >
                                            Gửi
                                        </button>
                                    </div>
                                )}

                                {comment.replies && comment.replies.length > 0 && (
                                    <div className="mt-3 pl-4 border-l-2 border-gray-300 space-y-2">
                                        {comment.replies.map((reply) => (
                                            <div key={reply.commentId} className="flex gap-3">
                                                <img
                                                    src={reply.user?.avatarUrl || 'https://via.placeholder.com/32'}
                                                    alt={reply.user?.fullName}
                                                    className="w-8 h-8 rounded-full object-cover"
                                                />
                                                <div>
                                                    <div className="text-sm font-semibold text-gray-800">
                                                        {reply.user?.fullName}
                                                    </div>
                                                    <div className="text-xs text-gray-500">
                                                        {formatShortDate(reply.createdAt)}
                                                    </div>
                                                    <p className="text-sm text-gray-700">{reply.content}</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};
