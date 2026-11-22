import { Bell, BellOff, MessagesSquare, Pin, PinOff, Search } from 'lucide-react';
import { useMemo, useRef, useState } from 'react';

import { useChatNotificationMutation, useChatPinMutation, useChatRoomsQuery } from '../api/queries';
import { formatRoomTime } from '../model/format';

import { RoomAvatar } from './ChatAvatar';

import type { ChatRoomSummaryDTO } from '../api/dto';

import { Button } from '@/shared/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from '@/shared/components/ui/dialog';
import { InputGroup, InputGroupAddon, InputGroupInput } from '@/shared/components/ui/input-group';
import { cn } from '@/shared/lib/utils';

type ChatRoomListProps = {
  activeRoomId: number | null;
  onSelect: (roomId: number) => void;
  className?: string;
};

export const ChatRoomList = ({ activeRoomId, onSelect, className }: ChatRoomListProps) => {
  const { data: rooms = [], isLoading, isError, refetch } = useChatRoomsQuery();
  const [query, setQuery] = useState('');
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

  return (
    <section className={cn('flex min-h-0 flex-col', className)}>
      {/* 검색 */}
      <div className="border-b border-gray-100 p-3">
        <InputGroup className="bg-white">
          <InputGroupAddon>
            <Search className="size-4" />
          </InputGroupAddon>
          <InputGroupInput
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="채팅방, 이름 검색"
            className="px-3 py-1"
          />
        </InputGroup>
      </div>

      {/* 목록 */}
      <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain">
        {isLoading ? (
          <div className="divide-y divide-gray-100">
            {[0, 1, 2, 3].map((i) => (
              <div key={i} className="flex items-center gap-3 px-4 py-3">
                <div className="size-11 animate-pulse rounded-full bg-gray-100" />
                <div className="flex-1 space-y-2">
                  <div className="h-3.5 w-1/3 animate-pulse rounded bg-gray-100" />
                  <div className="h-3 w-2/3 animate-pulse rounded bg-gray-100" />
                </div>
              </div>
            ))}
          </div>
        ) : isError ? (
          <div className="flex flex-col items-center gap-3 py-14 text-sm text-gray-400">
            채팅방을 불러오지 못했습니다.
            <Button size="sm" variant="outline" onClick={() => void refetch()}>
              다시 시도
            </Button>
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center gap-2 py-14 text-center text-sm text-gray-400">
            <MessagesSquare className="size-8 text-gray-300" />
            {query ? '검색 결과가 없습니다.' : '아직 채팅방이 없습니다.'}
          </div>
        ) : (
          <ul>
            {filtered.map((room, i) => {
              // 고정 그룹과 일반 그룹 사이는 굵은 구분선
              const groupBreak = i > 0 && filtered[i - 1].is_pinned && !room.is_pinned;
              return (
                <li
                  key={room.id}
                  className={cn(
                    i > 0 && 'border-t',
                    groupBreak ? 'border-t-4 border-gray-100' : 'border-gray-100',
                  )}
                >
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
      ? '모든 직원이 함께하는 채팅방입니다.'
      : '대화를 시작해보세요.';
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
          'flex w-full select-none items-center gap-3 border-l-4 px-4 py-3 text-left transition-colors [-webkit-touch-callout:none]',
          'focus-visible:outline-none focus-visible:bg-gray-50',
          active
            ? 'border-l-mega bg-mega-soft'
            : 'border-l-transparent hover:bg-gray-50/80 active:bg-gray-100/70',
        )}
      >
        <RoomAvatar isGlobal={room.is_global} members={room.member_preview} />

        <span className="min-w-0 flex-1">
          <span className="flex items-center gap-1.5">
            <span
              className={cn(
                'truncate text-sm text-gray-900',
                hasUnread ? 'font-bold' : 'font-semibold',
              )}
            >
              {room.name}
            </span>
            {room.is_global ? (
              <span className="shrink-0 rounded border border-navy-200 bg-navy-50 px-1.5 py-px text-[10px] font-medium text-navy-700">
                전체
              </span>
            ) : (
              room.member_count > 2 && (
                <span className="shrink-0 text-xs text-gray-400 tabular-nums">
                  {room.member_count}
                </span>
              )
            )}
            {room.is_pinned && (
              <Pin
                className="size-3 shrink-0 rotate-45 text-mega-secondary"
                aria-label="상단 고정됨"
              />
            )}
            {!room.notify_enabled && (
              <BellOff className="size-3 shrink-0 text-gray-400" aria-label="알림 꺼짐" />
            )}
            <span className="ml-auto shrink-0 pl-2 text-xs text-gray-400 tabular-nums">
              {formatRoomTime(last?.created_at ?? null)}
            </span>
          </span>
          <span className="mt-0.5 flex items-center gap-2">
            <span
              className={cn(
                'line-clamp-1 flex-1 text-xs break-all',
                hasUnread ? 'text-gray-600' : 'text-gray-400',
              )}
            >
              {preview}
            </span>
            {hasUnread && (
              <span
                className={cn(
                  'h-[18px] min-w-[18px] shrink-0 rounded-full px-1 text-center text-[10px] font-bold leading-[18px] text-white tabular-nums',
                  room.notify_enabled ? 'bg-red-500' : 'bg-gray-400',
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
          'absolute top-1/2 right-3 hidden size-8 -translate-y-1/2 items-center justify-center rounded-lg border border-gray-200 bg-white text-gray-500 shadow-xs',
          'opacity-0 transition hover:text-mega group-hover/row:opacity-100 focus-visible:opacity-100',
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
    'flex w-full items-center gap-3 rounded-lg px-3 py-3 text-left text-sm font-medium text-gray-800 transition-colors hover:bg-gray-50 active:bg-gray-100 disabled:opacity-50';

  return (
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <DialogContent showCloseButton={false} className="max-w-[300px] gap-1 p-2 sm:p-2">
        <div className="border-b border-gray-100 px-3 pt-2 pb-3">
          <DialogTitle className="truncate text-sm font-semibold">{room.name}</DialogTitle>
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
            <PinOff className="size-4 text-gray-500" />
          ) : (
            <Pin className="size-4 text-mega" />
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
            <BellOff className="size-4 text-gray-500" />
          ) : (
            <Bell className="size-4 text-mega" />
          )}
          {room.notify_enabled ? '알림 끄기' : '알림 켜기'}
        </button>
      </DialogContent>
    </Dialog>
  );
};
