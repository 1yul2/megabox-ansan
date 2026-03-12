import { useParams } from 'react-router';

import { useCommunityPostDetailQuery } from '../../api/queries';

import BoardDetailContent from './BoardDetailContent';

import type { BoardDetailProps } from '../../model/boardType';

export default function BoardDetail({ icon, title }: BoardDetailProps) {
  const { id } = useParams<{ id: string }>();
  const postId = Number(id);

  const { data: post, isLoading, isError } = useCommunityPostDetailQuery(postId);

  if (isLoading) return <div>로딩 중...</div>;
  if (isError || !post) return <div>게시글을 불러올 수 없습니다.</div>;

  return <BoardDetailContent post={post} icon={icon} title={title} />;
}
