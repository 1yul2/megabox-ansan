import { Megaphone } from 'lucide-react';
import { useParams } from 'react-router';

import { useCommunityPostDetailQuery } from '@/features/community/api/queries';
import { mapBoardDetail } from '@/features/community/model/mapper';
import CommentSection from '@/features/community/ui/comment/CommentSection';
import BoardDetail from '@/features/community/ui/detail/BoardDetail';

export default function NoticeDetail() {
  const { id } = useParams<{ id: string }>();
  const postId = Number(id);

  const { data, isLoading } = useCommunityPostDetailQuery(
    // fetch 임의 방지
    isNaN(postId) ? -1 : postId,
  );

  if (!id || isNaN(postId)) return <div>잘못된 접근입니다.</div>;
  if (isLoading) return <div>로딩 중...</div>;
  if (!data) return <div>존재하지 않는 공지사항입니다.</div>;

  const boardItem = mapBoardDetail(data);

  return (
    <BoardDetail
      title="공지사항"
      icon={<Megaphone />}
      list={[boardItem]}
      notFoundMessage="존재하지 않는 공지사항입니다."
    >
      <CommentSection postId={data.id} currentUserId={1} />
    </BoardDetail>
  );
}
