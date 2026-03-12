import { useState } from 'react';

import { useUpdatePostMutation } from '../api/queries';

import type { CommunityPostDTO } from '../api/dto';

export function useEditPostFlow() {
  const updateMutation = useUpdatePostMutation();

  const [editPost, setEditPost] = useState<CommunityPostDTO | null>(null);
  const [selectedPostId, setSelectedPostId] = useState<number | null>(null);

  const startEdit = (post: CommunityPostDTO) => {
    setSelectedPostId(null);
    setEditPost(post);
  };

  const openDetail = (postId: number) => {
    setEditPost(null);
    setSelectedPostId(postId);
  };

  const submitEdit = async (data: { title: string; content: string }) => {
    if (!editPost) return;

    await updateMutation.mutateAsync({
      id: editPost.id,
      data,
    });

    setEditPost(null);

    setSelectedPostId(editPost.id);
  };

  return {
    editPost,
    selectedPostId,
    openDetail,
    startEdit,
    submitEdit,
    closeEdit: () => setEditPost(null),
    closeDetail: () => setSelectedPostId(null),
  };
}
