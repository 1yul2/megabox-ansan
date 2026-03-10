import { useState } from 'react';

import { Badge } from '../../../features/community/ui/badge';

import { useCommunityPostsQuery } from '@/features/community/api/queries';
import {
  getIconForCategory,
  getTitleForCategory,
  mapCategoryToVariant,
} from '@/features/community/model/category';
import { BoardPage } from '@/features/community/ui/main/BoardPage';

export default function CommunityPage() {
  const [page, setPage] = useState(1);

  const { data, isLoading } = useCommunityPostsQuery({
    page,
    page_size: 10,
  });

  if (isLoading) return <div>로딩 중...</div>;

  return (
    <BoardPage
      list={data?.items ?? []}
      category="전체"
      renderBadge={(item) => (
        <Badge variant={mapCategoryToVariant(item.category)} label={item.category} />
      )}
      pagination={{
        currentPage: page,
        totalPages: data?.total_pages ?? 1,
        onChangePage: setPage,
      }}
      title={(item) => getTitleForCategory(item.category)}
      icon={(item) => getIconForCategory(item.category)}
    />
  );
}
