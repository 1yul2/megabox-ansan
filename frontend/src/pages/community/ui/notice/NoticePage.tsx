import { Megaphone } from 'lucide-react';
import { useState } from 'react';

import { Badge } from '../../../../features/community/ui/badge';
import CommunityModal from '../../../../features/community/ui/modal/CommunityModal';

import { hasAdminAccess } from '@/entities/user/model/role';
import { useCommunityPostsQuery } from '@/features/community/api/queries';
import { BoardPage } from '@/features/community/ui/main/BoardPage';
import { useUserQuery } from '@/entities/user/api/queries';

export default function NoticePage() {
  const { data: user } = useUserQuery();

  const [page, setPage] = useState(1);

  const { data, isLoading } = useCommunityPostsQuery({
    category: '공지',
    page,
    page_size: 5,
  });

  const noticeList = data?.items ?? [];

  if (isLoading) {
    return <div>로딩 중...</div>;
  }

  return (
    <BoardPage
      list={noticeList}
      canWrite={!!user && hasAdminAccess(user.position)}
      category="공지"
      renderBadge={() => <Badge variant="notice" label="공지" />}
      pagination={{
        currentPage: page,
        totalPages: data?.total_pages ?? 1,
        onChangePage: setPage,
      }}
      ModalComponent={(props) => (
        <CommunityModal {...props} mode="create" category="공지" onSubmit={async () => {}} />
      )}
      icon={<Megaphone />}
      title="공지사항"
    />
  );
}
