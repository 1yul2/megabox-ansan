import { Pencil, Trash2 } from 'lucide-react';
import { useState } from 'react';

import type { ScheduleResponse } from '../model/type';

import { getPositionBlockSolid } from '@/entities/user/model/position';
import ConfirmDialog from '@/shared/components/ui/confirm-dialog';
import { getAvatarSrc } from '@/shared/lib/avatar';
import { cn } from '@/shared/lib/utils';

const TIMELINE_START = 6 * 60; // 360 min
const TIMELINE_TOTAL = 24 * 60; // 1440 min (06:00 ~ 30:00, 24시간)

function parseMinutes(t: string): number {
  const parts = t.split(':');
  return Number(parts[0]) * 60 + Number(parts[1] ?? 0);
}

interface ScheduleCardProps {
  schedule: ScheduleResponse;
  isAdmin?: boolean;
  onEdit?: (schedule: ScheduleResponse) => void;
  onDelete?: (id: number) => void;
  isDeleting?: boolean;
  col: number;
  totalCols: number;
  containerHeight: number;
}

const ScheduleCard = ({
  schedule,
  isAdmin,
  onEdit,
  onDelete,
  isDeleting = false,
  col,
  totalCols,
  containerHeight,
}: ScheduleCardProps) => {
  const [hovered, setHovered] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);

  const startMin = parseMinutes(schedule.start_time);
  // 야간 근무(자정 넘김): end_time < start_time이면 다음날 시간으로 처리
  const rawEndMin = parseMinutes(schedule.end_time);
  const endMin = rawEndMin <= startMin ? rawEndMin + 24 * 60 : rawEndMin;
  const isOvernight = rawEndMin <= startMin;

  const top = ((startMin - TIMELINE_START) / TIMELINE_TOTAL) * containerHeight;
  const height = Math.max(((endMin - startMin) / TIMELINE_TOTAL) * containerHeight, 22);

  const GAP = 2;
  const colWidth = (100 - GAP * (totalCols + 1)) / totalCols;
  const leftPct = GAP + col * (colWidth + GAP);

  const style = getPositionBlockSolid(schedule.user_position);
  const avatarUrl = getAvatarSrc(schedule.user_profile_image, schedule.user_gender);

  return (
    <>
      <div
        className={cn(
          'absolute rounded-md overflow-hidden cursor-default select-none',
          'border shadow-sm transition-all duration-150',
          style.bg,
          style.border,
          style.hover,
          hovered && 'shadow-lg z-20 brightness-110',
        )}
        style={{
          top: `${top}px`,
          height: `${height}px`,
          width: `${colWidth}%`,
          left: `${leftPct}%`,
          zIndex: hovered ? 20 : col + 1,
        }}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
      >
        <div className="px-1.5 py-0.5 h-full flex flex-col justify-start">
          <p
            className={cn(
              'flex items-center gap-0.5 min-w-0 text-[10px] font-bold leading-tight',
              style.text,
            )}
          >
            {/* 프로필 아이콘 — 이름 줄 높이(≈12px) 안에 맞춰 카드 크기 유지 */}
            <span className="flex items-center justify-center size-3 rounded-full bg-white/30 shrink-0 overflow-hidden">
              {avatarUrl ? (
                <img src={avatarUrl} alt="" loading="lazy" className="size-full object-cover" />
              ) : (
                <span className="text-[7px] leading-none">{schedule.user_name.charAt(0)}</span>
              )}
            </span>
            <span className="truncate">{schedule.user_name}</span>
          </p>
          {height >= 38 && (
            <p className={cn('text-[9px] leading-tight opacity-80 truncate', style.text)}>
              {schedule.start_time}~{schedule.end_time}
            </p>
          )}
          {height >= 54 && (
            <span className="mt-0.5 inline-block px-1 bg-white/25 rounded text-[8px] text-white font-medium leading-4 w-fit">
              {schedule.user_position}
            </span>
          )}
          {isOvernight && height >= 28 && (
            <span className="mt-auto inline-block px-1 bg-black/20 rounded text-[7px] text-white/90 leading-4 w-fit">
              야간
            </span>
          )}
        </div>

        {/* Admin action overlay */}
        {isAdmin && hovered && (
          <div className="absolute top-0.5 right-0.5 flex gap-0.5 z-30">
            <button
              type="button"
              className="p-0.5 rounded bg-white/20 hover:bg-white/40 transition-colors"
              onClick={(e) => {
                e.stopPropagation();
                onEdit?.(schedule);
              }}
              aria-label="수정"
            >
              <Pencil className={cn('size-2.5', style.text)} />
            </button>
            <button
              type="button"
              className="p-0.5 rounded bg-white/20 hover:bg-red-500/60 transition-colors"
              onClick={(e) => {
                e.stopPropagation();
                setDeleteConfirmOpen(true);
              }}
              aria-label="삭제"
            >
              <Trash2 className={cn('size-2.5', style.text)} />
            </button>
          </div>
        )}
      </div>

      {/* Delete confirmation dialog */}
      <ConfirmDialog
        open={deleteConfirmOpen}
        title="스케줄 삭제"
        description={`${schedule.user_name}님의 ${schedule.work_date} ${schedule.start_time}~${schedule.end_time} 스케줄을 삭제하시겠습니까? 관련된 근무교대 신청도 함께 삭제됩니다.`}
        confirmLabel="삭제"
        variant="destructive"
        isPending={isDeleting}
        onConfirm={() => {
          onDelete?.(schedule.id);
          setDeleteConfirmOpen(false);
        }}
        onCancel={() => setDeleteConfirmOpen(false)}
      />
    </>
  );
};

export default ScheduleCard;
