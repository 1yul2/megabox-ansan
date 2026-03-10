import { MessagesSquare } from 'lucide-react';
import { useState } from 'react';

import { Badge } from '../../../../features/community/ui/badge';
import CommunityModal from '../../../../features/community/ui/modal/CommunityModal';

import { useCommunityPostsQuery } from '@/features/community/api/queries';
import { BoardPage } from '@/features/community/ui/main/BoardPage';

export default function FreeboardPage() {
  const [page, setPage] = useState(1);
  const { data, isLoading } = useCommunityPostsQuery({
    category: '자유게시판',
    page,
    page_size: 5,
  });

  if (isLoading) return <div>로딩 중...</div>;

  const freeBoardList = data?.items ?? [];

  return (
    <BoardPage
      list={freeBoardList}
      canWrite={true}
      category="자유게시판"
      renderBadge={() => <Badge variant="free" label="자유" />}
      pagination={{
        currentPage: page,
        totalPages: data?.total_pages ?? 1,
        onChangePage: setPage,
      }}
      ModalComponent={(props) => (
        <CommunityModal {...props} mode="create" category="자유게시판" onSubmit={async () => {}} />
      )}
      icon={<MessagesSquare />}
      title="자유게시판"
    />
  );
}
