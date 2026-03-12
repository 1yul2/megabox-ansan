import { toast } from 'sonner';

import { useDeletePostMutation } from '../../api/queries';
import { formatRelativeTime } from '../../model/formatData';
import CommentSection from '../comment/CommentSection';

import type { CommunityPostDTO } from '../../api/dto';

import { useUserQuery } from '@/entities/user/api/queries';

interface BoardDetailContentProps {
  post: CommunityPostDTO;
  icon?: React.ReactNode;
  title?: string;
  onEdit?: (post: CommunityPostDTO) => void;
  onClose?: () => void;
}

export default function BoardDetailContent({
  post,
  icon,
  title,
  onClose,
  onEdit,
}: BoardDetailContentProps) {
  const { data: user } = useUserQuery();

  const deleteMutation = useDeletePostMutation();

  if (!user) return <div>로그인이 필요합니다.</div>;

  const isMine = post.author_id === user.id;
  const formattedDate = formatRelativeTime(post.created_at);

  const handleDelete = async () => {
    if (!confirm('정말 삭제하시겠습니까?')) return;

    try {
      await deleteMutation.mutateAsync(post.id);
      toast.success('삭제되었습니다.');

      onClose?.();
    } catch {
      toast.error('삭제가 실패되었습니다.');
    }
  };

  return (
    <div className="flex flex-col">
      <div className="bg-gradient-to-r from-mega to-mega/90 text-white px-6 py-4">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2 text-sm font-medium">
            {icon}
            {title}
          </div>

          <button onClick={onClose} className="text-2xl text-white/80 hover:text-white">
            ×
          </button>
        </div>
      </div>

      <div className="p-6 flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <div className="flex flex-col gap-1">
            <div className="text-lg font-bold">{post.title}</div>
            <div className="text-xs text-gray-500">
              {post.author_name} · {formattedDate}
              {post.updated_at !== post.created_at ? ' · (수정됨)' : ''}
            </div>
          </div>

          {isMine && (
            <div className="flex gap-2 opacity-70">
              <button
                onClick={() => onEdit?.(post)}
                className="text-sm text-blue-600 hover:underline"
              >
                수정
              </button>
              <span>|</span>
              <button
                onClick={() => {
                  void handleDelete();
                }}
                className="text-sm text-red-600 hover:underline"
              >
                삭제
              </button>
            </div>
          )}
        </div>

        <div className="whitespace-pre-line leading-7 text-sm text-gray-600">{post.content}</div>
      </div>

      <CommentSection postId={post.id} currentUserId={user.id} />
    </div>
  );
}
