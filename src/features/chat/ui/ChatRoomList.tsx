import { Bell, BellOff, MessageSquarePlus, Pin, PinOff, Search, Sparkles } from 'lucide-react';
import { useMemo, useRef, useState } from 'react';

import { useChatNotificationMutation, useChatPinMutation, useChatRoomsQuery } from '../api/queries';
import { formatRoomTime } from '../model/format';
import { useChatConnected } from '../model/useChatRealtime';

import { RoomAvatar } from './ChatAvatar';
import { CreateRoomDialog } from './CreateRoomDialog';

import type { ChatRoomSummaryDTO } from '../api/dto';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from '@/shared/components/ui/dialog';
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
  const [actionRoomId, setActionRoomId] = useState<number | null>(null);
  const { mutate: setPinned } = useChatPinMutation();

  const actionRoom = rooms.find((r) => r.id === actionRoomId) ?? null;
  const togglePin = (room: ChatRoomSummaryDTO) =>
    setPinned({ roomId: room.id, pinned: !room.is_pinned });

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
            {filtered.map((room, i) => {
              // 고정 그룹과 일반 그룹 사이 구분선
              const showDivider = i > 0 && filtered[i - 1].is_pinned && !room.is_pinned;
              return (
                <li key={room.id}>
                  {showDivider && (
                    <div className="mx-3 my-2 h-px bg-linear-to-r from-transparent via-black/[0.08] to-transparent" />
                  )}
                  <RoomRow
                    room={room}
                    active={room.id === activeRoomId}
                    onClick={() => onSelect(room.id)}
                    onTogglePin={() => togglePin(room)}
                    onOpenActions={() => setActionRoomId(room.id)}
                  />
                </li>
              );
            })}
          </ul>
        )}
      </div>

      {actionRoom && (
        <RoomActionsDialog
          room={actionRoom}
          onClose={() => setActionRoomId(null)}
          onTogglePin={() => togglePin(actionRoom)}
        />
      )}

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

const LONG_PRESS_MS = 450;

const RoomRow = ({
  room,
  active,
  onClick,
  onTogglePin,
  onOpenActions,
}: {
  room: ChatRoomSummaryDTO;
  active: boolean;
  onClick: () => void;
  onTogglePin: () => void;
  onOpenActions: () => void;
}) => {
  const pressTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const longPressed = useRef(false);

  const cancelPress = () => {
    if (pressTimer.current) clearTimeout(pressTimer.current);
    pressTimer.current = null;
  };

  // 모바일: 길게 눌러 고정/알림 메뉴
  const handlePointerDown = (e: React.PointerEvent) => {
    if (e.pointerType !== 'touch') return;
    longPressed.current = false;
    cancelPress();
    pressTimer.current = setTimeout(() => {
      longPressed.current = true;
      navigator.vibrate?.(10);
      onOpenActions();
    }, LONG_PRESS_MS);
  };

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
    <div className="group/row relative">
      <button
        type="button"
        onClick={() => {
          if (longPressed.current) {
            longPressed.current = false;
            return;
          }
          onClick();
        }}
        onPointerDown={handlePointerDown}
        onPointerUp={cancelPress}
        onPointerLeave={cancelPress}
        onPointerMove={cancelPress}
        onContextMenu={(e) => {
          e.preventDefault();
          cancelPress();
          onOpenActions();
        }}
        aria-current={active ? 'true' : undefined}
        className={cn(
          'group flex w-full select-none items-center gap-3 rounded-2xl p-3 text-left transition-all duration-200 [-webkit-touch-callout:none]',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-mega-secondary/40',
          active
            ? 'bg-white shadow-[0_8px_24px_-12px_rgba(23,43,77,0.35)] ring-1 ring-mega-secondary/15'
            : room.is_pinned
              ? 'bg-mega-secondary/[0.035] hover:bg-white/80 active:scale-[0.99]'
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
            {room.is_pinned && (
              <Pin
                className="size-3 shrink-0 rotate-45 fill-mega-secondary text-mega-secondary"
                aria-label="상단 고정됨"
              />
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
                  room.notify_enabled
                    ? 'bg-linear-to-r from-[#ff5f6d] to-[#ff2d55]'
                    : 'bg-gray-300',
                )}
              >
                {room.unread_count > 99 ? '99+' : room.unread_count}
              </span>
            )}
          </span>
        </span>
      </button>

      {/* 데스크탑: 마우스 올리면 고정 토글 버튼 */}
      <button
        type="button"
        onClick={onTogglePin}
        aria-label={room.is_pinned ? '상단 고정 해제' : '상단 고정'}
        title={room.is_pinned ? '고정 해제' : '상단 고정'}
        className={cn(
          'absolute top-1/2 right-2.5 hidden size-8 -translate-y-1/2 items-center justify-center rounded-full bg-white text-gray-400 shadow-md ring-1 ring-black/5',
          'opacity-0 transition hover:text-mega-secondary group-hover/row:opacity-100 focus-visible:opacity-100',
          '[@media(hover:hover)]:flex',
        )}
      >
        {room.is_pinned ? <PinOff className="size-4" /> : <Pin className="size-4" />}
      </button>
    </div>
  );
};

/** 채팅방 빠른 메뉴 (모바일 길게 누르기 / 데스크탑 우클릭) */
const RoomActionsDialog = ({
  room,
  onClose,
  onTogglePin,
}: {
  room: ChatRoomSummaryDTO;
  onClose: () => void;
  onTogglePin: () => void;
}) => {
  const notification = useChatNotificationMutation(room.id);
  const itemClass =
    'flex w-full items-center gap-3 rounded-2xl px-4 py-3.5 text-left text-[15px] font-medium text-gray-800 transition-colors hover:bg-gray-50 active:bg-gray-100';

  return (
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <DialogContent showCloseButton={false} className="max-w-[300px] gap-1 rounded-3xl p-2 sm:p-2">
        <div className="px-4 pt-3 pb-2">
          <DialogTitle className="truncate text-base font-bold">{room.name}</DialogTitle>
          <DialogDescription className="sr-only">채팅방 빠른 메뉴</DialogDescription>
        </div>
        <button
          type="button"
          className={itemClass}
          onClick={() => {
            onTogglePin();
            onClose();
          }}
        >
          {room.is_pinned ? (
            <PinOff className="size-5 text-gray-500" />
          ) : (
            <Pin className="size-5 text-mega-secondary" />
          )}
          {room.is_pinned ? '상단 고정 해제' : '채팅방 상단 고정'}
        </button>
        <button
          type="button"
          className={itemClass}
          disabled={notification.isPending}
          onClick={() => notification.mutate(!room.notify_enabled, { onSuccess: onClose })}
        >
          {room.notify_enabled ? (
            <BellOff className="size-5 text-gray-500" />
          ) : (
            <Bell className="size-5 text-mega-secondary" />
          )}
          {room.notify_enabled ? '알림 끄기' : '알림 켜기'}
        </button>
      </DialogContent>
    </Dialog>
  );
};
