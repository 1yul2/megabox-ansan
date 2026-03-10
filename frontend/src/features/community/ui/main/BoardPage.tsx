import { useMemo, useState } from 'react';

import SearchInput from '../../../../shared/components/ui/SearchInput';
import { useCommunityPostDetailQuery } from '../../api/queries';
import { useEditPostFlow } from '../../model/useEditPostFlow';
import BoardDetailContent from '../detail/BoardDetailContent';
import CommunityModal from '../modal/CommunityModal';
import { DetailModal } from '../modal/DetailModal';
import Pagenation from '../Pagenation';

import { BoardCard } from './BoardCard';

import type { BoardPost, BoardProps } from '../../model/boardType';

import { Button } from '@/shared/components/ui/button';

export function BoardPage<T extends BoardPost>({
  list,
  canWrite,
  category,
  ModalComponent,
  pagination,
  renderBadge,
  title,
  icon,
}: BoardProps<T>) {
  const { editPost, selectedPostId, startEdit, submitEdit, closeEdit, closeDetail, openDetail } =
    useEditPostFlow();

  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const { data: detailPost } = useCommunityPostDetailQuery(selectedPostId);

  const filteredList = useMemo(
    () =>
      !searchTerm
        ? list
        : list.filter((item) =>
            Object.values(item).some(
              (value) =>
                value != null && String(value).toLowerCase().includes(searchTerm.toLowerCase()),
            ),
          ),
    [searchTerm, list],
  );

  return (
    <div className="flex flex-col gap-6">
      <div className="flex gap-2">
        <SearchInput onSearch={setSearchTerm} placeholder="검색어를 입력하세요" />

        {canWrite && (
          <Button onClick={() => setIsOpen(true)} className="bg-mega text-white text-xs">
            ＋ 글쓰기
          </Button>
        )}
      </div>

      <div className="flex flex-col gap-4">
        {filteredList.map((item) => (
          <BoardCard
            key={item.id}
            item={item}
            badge={renderBadge?.(item)}
            onClick={() => openDetail(item.id)}
          />
        ))}
      </div>

      {pagination && (
        <Pagenation
          totalPages={pagination.totalPages}
          currentPage={pagination.currentPage}
          onChangePage={pagination.onChangePage}
        />
      )}

      {isOpen && ModalComponent && (
        <ModalComponent
          onClose={() => setIsOpen(false)}
          category={category!}
          onSubmit={(data: { title: string; content: string }) => {
            console.log(data);
          }}
        />
      )}
      {detailPost && (
        <DetailModal onClose={closeDetail}>
          <BoardDetailContent
            post={detailPost}
            title={typeof title === 'function' ? title(detailPost) : title}
            icon={typeof icon === 'function' ? icon(detailPost) : icon}
            onEdit={startEdit}
            onClose={closeDetail}
          />
        </DetailModal>
      )}
      {editPost && (
        <CommunityModal
          mode="edit"
          category={editPost.category}
          initialData={{
            title: editPost.title,
            content: editPost.content,
          }}
          onSubmit={submitEdit}
          onClose={closeEdit}
        />
      )}
    </div>
  );
}
