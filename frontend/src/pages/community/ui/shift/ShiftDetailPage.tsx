import { CalendarSync } from 'lucide-react';
import { useParams } from 'react-router';

import type { ShiftPost } from '@/features/community/mock/communityMock';

import { ShiftCompareSection } from '@/features/community//ui/shift/ShiftCompareSection';
import { communityPostList } from '@/features/community/mock/communityMock';
import {
  APPROVAL_STATUS_LABEL,
  APPROVAL_STATUS_STYLE,
} from '@/features/community/model/statusLabel';

export default function ShiftDetailPage() {
  const { id } = useParams<{ id: string }>();

  const post = communityPostList.find(
    (item): item is ShiftPost => item.category === 'SHIFT' && item.id === Number(id),
  );

  if (!post) {
    return <div className="p-6">존재하지 않는 게시글입니다.</div>;
  }

  const getShiftTypeLabel = (type: ShiftPost['shiftType']) => (type === 'SWAP' ? '교대' : '대체');

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center gap-2 text-2xl font-bold">
        <CalendarSync />
        <span>근무교대 / 근무대체</span>
      </div>

      <hr />

      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-semibold">{getShiftTypeLabel(post.shiftType)}</h2>
          <p className="text-sm text-gray-500">
            {post.author} · {post.createdAt}
          </p>
        </div>

        <span
          className={`px-2 py-1 rounded text-sm
              ${APPROVAL_STATUS_STYLE[post.approvalStatus]}`}
        >
          {APPROVAL_STATUS_LABEL[post.approvalStatus]}
        </span>
      </div>

      <div className="grid grid-cols-2 gap-10 mt-8">
        <ShiftCompareSection
          title="변경 전"
          badgeClassName="bg-purple-100 text-mega"
          requesterName={post.author}
          requesterTime={post.requesterWorkTime}
          targetName={post.targetWorker}
          targetTime={post.desiredWorkTime}
        />

        <ShiftCompareSection
          title="변경 후"
          badgeClassName="bg-mega text-white"
          requesterName={post.author}
          requesterTime={post.desiredWorkTime}
          targetName={post.targetWorker}
          targetTime={post.requesterWorkTime}
        />
      </div>
    </div>
  );
}
