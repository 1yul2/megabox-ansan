import { BellOff, MessageSquarePlus, Search, Sparkles } from 'lucide-react';
import { useMemo, useState } from 'react';

import { useChatRoomsQuery } from '../api/queries';
import { formatRoomTime } from '../model/format';
import { useChatConnected } from '../model/useChatRealtime';

import { RoomAvatar } from './ChatAvatar';
import { CreateRoomDialog } from './CreateRoomDialog';

import type { ChatRoomSummaryDTO } from '../api/dto';

import { cn } from '@/shared/lib/utils';

type ChatRoomListProps = {
  activeRoomId: number | null;
  onSelect: (roomId: number) => void;
  className?: string;
};

export const ChatRoomList = ({ activeRoomId, onSelect, className }: ChatRoomListProps) => {
  const { data: rooms = [], isLoading, isError, refetch } = useChatRoomsQuery();
  const connected = useChatConnected();
  const [query, setQuery] = useState('');
  const [createOpen, setCreateOpen] = useState(false);

  const filtered = useMemo(() => {
    const q = query.trim();
    if (!q) return rooms;
    return rooms.filter(
      (r) => r.name.includes(q) || r.member_preview.some((m) => m.name.includes(q)),
    );
  }, [rooms, query]);

  const totalUnread = rooms.reduce((sum, r) => sum + r.unread_count, 0);

  return (
    <section className={cn('flex min-h-0 flex-col', className)}>
      {/* 헤더 */}
      <div className="flex items-end justify-between gap-3 px-1 pb-4 lg:px-5 lg:pt-5">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight text-gray-900">채팅</h1>
            {totalUnread > 0 && (
              <span className="rounded-full bg-mega-secondary/10 px-2 py-0.5 text-xs font-bold text-mega-secondary tabular-nums">
                {totalUnread > 99 ? '99+' : totalUnread}
              </span>
            )}
          </div>
          <p className="mt-0.5 flex items-center gap-1.5 text-xs text-gray-400">
            <span
              className={cn(
                'size-1.5 rounded-full',
                connected
                  ? 'bg-emerald-400 shadow-[0_0_0_3px_rgba(52,211,153,0.2)]'
                  : 'bg-gray-300',
              )}
            />
            {connected ? '실시간 연결됨' : '연결 중…'}
          </p>
        </div>
        <button
          type="button"
          onClick={() => setCreateOpen(true)}
          className={cn(
            'group inline-flex h-10 items-center gap-1.5 rounded-full pl-3 pr-4 text-sm font-semibold text-white',
            'bg-linear-to-r from-mega to-mega-secondary shadow-[0_8px_20px_-8px_rgba(23,43,77,0.6)]',
            'transition-transform active:scale-95 hover:brightness-110',
          )}
        >
          <MessageSquarePlus className="size-4 transition-transform group-hover:-rotate-6" />새 채팅
        </button>
      </div>

      {/* 검색 */}
      <div className="px-1 pb-3 lg:px-5">
        <label className="flex h-11 items-center gap-2 rounded-2xl bg-white px-3.5 ring-1 ring-black/[0.06] shadow-[0_1px_2px_rgba(0,0,0,0.03)] transition focus-within:ring-2 focus-within:ring-mega-secondary/30">
          <Search className="size-4 shrink-0 text-gray-400" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="채팅방, 이름 검색"
            className="min-w-0 flex-1 bg-transparent text-[15px] outline-none placeholder:text-gray-400"
          />
        </label>
      </div>

      {/* 목록 */}
      <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-0 pb-4 lg:px-3">
        {isLoading ? (
          <div className="space-y-2 px-1 lg:px-2">
            {[0, 1, 2, 3].map((i) => (
              <div key={i} className="flex items-center gap-3 rounded-2xl p-3">
                <div className="size-12 animate-pulse rounded-[18px] bg-gray-200/70" />
                <div className="flex-1 space-y-2">
                  <div className="h-3.5 w-1/3 animate-pulse rounded bg-gray-200/70" />
                  <div className="h-3 w-2/3 animate-pulse rounded bg-gray-100" />
                </div>
              </div>
            ))}
          </div>
        ) : isError ? (
          <div className="flex flex-col items-center gap-3 py-16 text-sm text-gray-400">
            채팅방을 불러오지 못했습니다.
            <button
              type="button"
              onClick={() => void refetch()}
              className="rounded-full bg-gray-100 px-4 py-1.5 font-medium text-gray-600 hover:bg-gray-200"
            >
              다시 시도
            </button>
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center gap-2 py-16 text-center text-sm text-gray-400">
            <Sparkles className="size-6 text-gray-300" />
            {query ? '검색 결과가 없습니다.' : '아직 채팅방이 없습니다.'}
          </div>
        ) : (
          <ul className="space-y-1">
            {filtered.map((room) => (
              <li key={room.id}>
                <RoomRow
                  room={room}
                  active={room.id === activeRoomId}
                  onClick={() => onSelect(room.id)}
                />
              </li>
            ))}
          </ul>
        )}
      </div>

      <CreateRoomDialog
        open={createOpen}
        onOpenChange={setCreateOpen}
        onCreated={(id) => {
          setCreateOpen(false);
          onSelect(id);
        }}
      />
    </section>
  );
};

const RoomRow = ({
  room,
  active,
  onClick,
}: {
  room: ChatRoomSummaryDTO;
  active: boolean;
  onClick: () => void;
}) => {
  const last = room.last_message;
  const preview = last
    ? last.message_type === 'system'
      ? last.content
      : room.is_global || room.member_count > 2
        ? `${last.sender_name ?? ''}: ${last.content}`
        : last.content
    : room.is_global
      ? '모든 직원이 함께하는 채팅방이에요'
      : '대화를 시작해보세요';
  const hasUnread = room.unread_count > 0;

  return (
    <button
      type="button"
      onClick={onClick}
      aria-current={active ? 'true' : undefined}
      className={cn(
        'group flex w-full items-center gap-3 rounded-2xl p-3 text-left transition-all duration-200',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-mega-secondary/40',
        active
          ? 'bg-white shadow-[0_8px_24px_-12px_rgba(23,43,77,0.35)] ring-1 ring-mega-secondary/15'
          : 'hover:bg-white/80 active:scale-[0.99]',
      )}
    >
      <span className="relative">
        <RoomAvatar isGlobal={room.is_global} members={room.member_preview} />
      </span>

      <span className="min-w-0 flex-1">
        <span className="flex items-center gap-1.5">
          <span
            className={cn(
              'truncate text-[15px] text-gray-900',
              hasUnread ? 'font-bold' : 'font-semibold',
            )}
          >
            {room.name}
          </span>
          {room.is_global ? (
            <span className="shrink-0 rounded-md bg-mega-secondary/10 px-1.5 py-px text-[10px] font-bold text-mega-secondary">
              전체
            </span>
          ) : (
            room.member_count > 2 && (
              <span className="shrink-0 text-xs font-medium text-gray-400 tabular-nums">
                {room.member_count}
              </span>
            )
          )}
          {!room.notify_enabled && <BellOff className="size-3 shrink-0 text-gray-300" />}
          <span className="ml-auto shrink-0 pl-2 text-[11px] text-gray-400 tabular-nums">
            {formatRoomTime(last?.created_at ?? null)}
          </span>
        </span>
        <span className="mt-0.5 flex items-center gap-2">
          <span
            className={cn(
              'line-clamp-1 flex-1 text-[13px] break-all',
              hasUnread ? 'text-gray-700' : 'text-gray-400',
              last?.is_deleted && 'italic',
            )}
          >
            {preview}
          </span>
          {hasUnread && (
            <span
              className={cn(
                'shrink-0 min-w-5 h-5 rounded-full px-1.5 text-center text-[11px] font-bold leading-5 text-white tabular-nums',
                room.notify_enabled ? 'bg-linear-to-r from-[#ff5f6d] to-[#ff2d55]' : 'bg-gray-300',
              )}
            >
              {room.unread_count > 99 ? '99+' : room.unread_count}
            </span>
          )}
        </span>
      </span>
    </button>
  );
};
