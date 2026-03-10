import { useCommunityPostsQuery } from "@/features/community/api/queries";
import { Badge } from "@/features/community/ui/badge";
import { BoardPage } from "@/features/community/ui/main/BoardPage";
import { useMemo, useState } from "react";

export default function DayoffPage() {
  const [page, setPage] = useState(1);

  const queryParams = useMemo(
    () => ({
      category: '휴무신청',
      page,
      page_size: 5,
    }),
    [page]
  );

  const { data, isLoading } = useCommunityPostsQuery(queryParams);

  if (isLoading) {
    return <div>로딩 중...</div>;
  }

  const dayoffList = data?.items ?? [];

  return (
    <BoardPage
      list={dayoffList}
      renderBadge={() => <Badge variant="dayoff" label="휴무" />}
      category="휴무신청"
      pagination={{
        currentPage: page,
        totalPages: data?.total_pages ?? 1,
        onChangePage: setPage,
      }}
      title={(post) => `[휴무] ${post.category}`}
    />
  );
}