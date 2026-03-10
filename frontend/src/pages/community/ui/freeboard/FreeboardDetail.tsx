import { MessagesSquare } from 'lucide-react';
import { useParams } from 'react-router';

import { useCommunityPostDetailQuery } from '@/features/community/api/queries';
import { mapBoardDetail } from '@/features/community/model/mapper';
import CommentSection from '@/features/community/ui/comment/CommentSection';
import BoardDetail from '@/features/community/ui/detail/BoardDetail';

export default function FreeBoardDetail() {
  const { id } = useParams<{ id: string }>();
  const { data, isLoading } = useCommunityPostDetailQuery(Number(id));

  if (!id) {
    return <div>잘못된 접근입니다.</div>;
  }

  if (isLoading) return <div>로딩 중...</div>;
  if (!data) return <div>존재하지 않는 게시글입니다.</div>;

  const boardItem = mapBoardDetail(data);

  return (
    <BoardDetail
      title="자유게시판"
      icon={<MessagesSquare />}
      list={[boardItem]}
      notFoundMessage="존재하지 않는 자유게시글입니다."
    >
      <CommentSection postId={Number(id)} currentUserId={1} />
    </BoardDetail>
  );
}
