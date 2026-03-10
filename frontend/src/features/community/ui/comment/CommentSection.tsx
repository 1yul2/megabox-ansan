import { MessageSquare } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

import {
  useCommentsQuery,
  useCreateCommentMutation,
  useDeleteCommentMutation,
  useUpdateCommentMutation,
} from '../../api/queries';
import Pagenation from '../Pagenation';

import CommentForm from './CommentForm';
import CommentList from './CommentList';

interface CommentSectionProps {
  postId: number;
  currentUserId: number;
}

export default function CommentSection({ postId, currentUserId }: CommentSectionProps) {
  const createCommentMutation = useCreateCommentMutation(postId);
  const updateCommentMutation = useUpdateCommentMutation(postId);
  const deleteCommentMutation = useDeleteCommentMutation(postId);

  const [page, setPage] = useState(1);

  const { data } = useCommentsQuery(postId, page);

  const comments = data?.items ?? [];

  const totalPages = data?.total_pages ?? 1;

  const handleCreate = (content: string) => {
    createCommentMutation.mutate(content, {
      onSuccess: () => {
        setPage(1);
      },
      onError: () => {
        toast.error('댓글 작성에 실패했습니다.');
      },
    });
  };

  const handleUpdate = (id: number, content: string) => {
    updateCommentMutation.mutate(
      { id, content },
      {
        onSuccess: () => {
          toast.success('댓글이 수정되었습니다.');
        },
        onError: () => {
          toast.error('댓글 수정을 실패하였습니다.');
        },
      },
    );
  };

  const handleDelete = (id: number) => {
    if (!confirm('댓글을 삭제하시겠습니까?')) return;
    deleteCommentMutation.mutate(id, {
      onSuccess: () => {
        setPage((prev) => Math.max(1, prev - 1));
        toast.success('댓글이 삭제되었습니다.');
      },
      onError: () => {
        toast.error('댓글 삭제를 실패하였습니다.');
      },
    });
  };

  return (
    <div className="mt-8 border-t border-gray-200 pt-6 flex flex-col gap-4 p-6">
      <div className="flex items-center gap-2">
        <MessageSquare size={15} color="#374151" />
        <h3 className="font-bold text-xs text-gray-700">댓글 {comments.length}</h3>
      </div>

      <CommentList
        comments={comments}
        currentUserId={currentUserId}
        onUpdate={handleUpdate}
        onDelete={handleDelete}
      />

      <Pagenation totalPages={totalPages} currentPage={page} onChangePage={setPage} />

      <CommentForm onSubmit={handleCreate} isLoading={createCommentMutation.isPending} />
    </div>
  );
}
