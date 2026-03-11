import { useState } from 'react';

import { Badge } from '../../../../features/community/ui/badge';
import { BoardPage } from '../../../../features/community/ui/main/BoardPage';

import { useCommunityPostsQuery } from '@/features/community/api/queries';

export default function ShiftPage() {
  const [page, setPage] = useState(1);

  const { data, isLoading } = useCommunityPostsQuery({
    category: '근무교대',
    page,
    page_size: 5,
  });

  if (isLoading) {
    return <div>로딩 중...</div>;
  }

  const shiftList = (data?.items ?? []).map((post) => ({
    id: post.id,
    title: post.title,
    content: post.content,
    author_name: post.author_name,
    created_at: post.created_at,
  }));

  return (
    <BoardPage
      list={shiftList}
      renderBadge={() => <Badge variant="shift" label="근무교대" />}
      category="근무교대"
      pagination={{
        currentPage: page,
        totalPages: data?.total_pages ?? 1,
        onChangePage: setPage,
      }}
      title="근무 교대"
    />
  );
}
