import { Bell, BellOff, Check, Crown, LogOut, Pencil, Pin, UserPlus, X } from 'lucide-react';
import { useState } from 'react';

import {
  useChatNotificationMutation,
  useChatPinMutation,
  useLeaveChatMutation,
  useRenameChatRoomMutation,
} from '../api/queries';

import { ChatAvatar, RoomAvatar } from './ChatAvatar';
import { InviteDialog } from './CreateRoomDialog';

import type { ChatRoomDetailDTO } from '../api/dto';

import ConfirmDialog from '@/shared/components/ui/confirm-dialog';
import { Sheet, SheetContent, SheetDescription, SheetTitle } from '@/shared/components/ui/sheet';
import { Switch } from '@/shared/components/ui/switch';
import { cn } from '@/shared/lib/utils';

type RoomInfoSheetProps = {
  room: ChatRoomDetailDTO;
  myId: number | undefined;
  isAdmin: boolean;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onLeft: () => void;
};

export const RoomInfoSheet = ({
  room,
  myId,
  isAdmin,
  open,
  onOpenChange,
  onLeft,
}: RoomInfoSheetProps) => {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState('');
  const [inviteOpen, setInviteOpen] = useState(false);
  const [leaveOpen, setLeaveOpen] = useState(false);

  const rename = useRenameChatRoomMutation(room.id);
  const notification = useChatNotificationMutation(room.id);
  const pin = useChatPinMutation();
  const leave = useLeaveChatMutation(room.id);

  const canRename = room.is_global ? isAdmin : room.is_owner || isAdmin;
  const others = room.members.filter((m) => m.id !== myId);

  const startEdit = () => {
    setDraft(room.custom_name ?? '');
    setEditing(true);
  };

  const saveName = () => {
    rename.mutate(draft.trim() || null, { onSuccess: () => setEditing(false) });
  };

  return (
    <>
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent
          side="right"
          className="flex w-full flex-col gap-0 bg-app-bg p-0 sm:max-w-[380px]"
        >
          {/* 상단 */}
          <div className="relative flex flex-col items-center gap-3 px-6 pt-[max(2.5rem,env(safe-area-inset-top))] pb-6 text-center">
            <button
              type="button"
              onClick={() => onOpenChange(false)}
              aria-label="닫기"
              className="absolute top-[max(0.75rem,env(safe-area-inset-top))] right-3 flex size-9 items-center justify-center rounded-full text-gray-400 hover:bg-black/5"
            >
              <X className="size-5" />
            </button>
            <RoomAvatar
              isGlobal={room.is_global}
              members={others.length ? others : room.members}
              className="size-20 rounded-[28px]"
            />
            {editing ? (
              <div className="flex w-full items-center gap-2">
                <input
                  autoFocus
                  value={draft}
                  maxLength={100}
                  onChange={(e) => setDraft(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.nativeEvent.isComposing) return;
                    if (e.key === 'Enter') saveName();
                    if (e.key === 'Escape') setEditing(false);
                  }}
                  placeholder={room.is_global ? '전체 채팅방' : '비우면 참여자 이름으로 표시'}
                  className="h-10 min-w-0 flex-1 rounded-xl bg-white px-3 text-center text-[15px] outline-none ring-1 ring-black/10 focus:ring-2 focus:ring-mega-secondary/40"
                />
                <button
                  type="button"
                  onClick={saveName}
                  disabled={rename.isPending}
                  aria-label="저장"
                  className="flex size-10 items-center justify-center rounded-xl bg-mega text-white disabled:opacity-60"
                >
                  <Check className="size-4" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-1.5">
                <SheetTitle className="text-lg font-bold text-gray-900 break-keep">
                  {room.name}
                </SheetTitle>
                {canRename && (
                  <button
                    type="button"
                    onClick={startEdit}
                    aria-label="이름 변경"
                    className="flex size-7 items-center justify-center rounded-full text-gray-400 hover:bg-black/5 hover:text-gray-600"
                  >
                    <Pencil className="size-3.5" />
                  </button>
                )}
              </div>
            )}
            <SheetDescription className="text-xs text-gray-400">
              {room.is_global
                ? '모든 직원이 자동으로 참여하는 채팅방'
                : `참여자 ${room.member_count}명`}
            </SheetDescription>
          </div>

          <div className="min-h-0 flex-1 space-y-4 overflow-y-auto px-4 pb-[max(1.5rem,env(safe-area-inset-bottom))]">
            {/* 상단 고정 */}
            <label className="flex cursor-pointer items-center gap-3 rounded-2xl bg-white p-4 ring-1 ring-black/[0.04]">
              <span
                className={cn(
                  'flex size-10 items-center justify-center rounded-xl transition-colors',
                  room.is_pinned
                    ? 'bg-mega-secondary/10 text-mega-secondary'
                    : 'bg-gray-100 text-gray-400',
                )}
              >
                <Pin className={cn('size-5 rotate-45', room.is_pinned && 'fill-current')} />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block text-[15px] font-semibold text-gray-900">상단 고정</span>
                <span className="text-xs text-gray-400">
                  {room.is_pinned
                    ? '새 메시지가 와도 고정한 방이 항상 위에 있어요'
                    : '채팅 목록 맨 위에 고정해요'}
                </span>
              </span>
              <Switch
                checked={room.is_pinned}
                disabled={pin.isPending}
                onCheckedChange={(v) => pin.mutate({ roomId: room.id, pinned: v })}
                aria-label="상단 고정"
              />
            </label>

            {/* 알림 */}
            <label className="flex cursor-pointer items-center gap-3 rounded-2xl bg-white p-4 ring-1 ring-black/[0.04]">
              <span
                className={cn(
                  'flex size-10 items-center justify-center rounded-xl transition-colors',
                  room.notify_enabled
                    ? 'bg-mega-secondary/10 text-mega-secondary'
                    : 'bg-gray-100 text-gray-400',
                )}
              >
                {room.notify_enabled ? <Bell className="size-5" /> : <BellOff className="size-5" />}
              </span>
              <span className="min-w-0 flex-1">
                <span className="block text-[15px] font-semibold text-gray-900">채팅방 알림</span>
                <span className="text-xs text-gray-400">
                  {room.notify_enabled
                    ? '새 메시지가 오면 푸시 알림을 받아요'
                    : '이 방의 푸시 알림을 받지 않아요'}
                </span>
              </span>
              <Switch
                checked={room.notify_enabled}
                disabled={notification.isPending}
                onCheckedChange={(v) => notification.mutate(v)}
                aria-label="채팅방 알림"
              />
            </label>

            {/* 멤버 */}
            <div className="rounded-2xl bg-white p-2 ring-1 ring-black/[0.04]">
              <p className="px-2 pt-2 pb-1 text-xs font-semibold text-gray-400">
                대화상대 {room.member_count}
              </p>
              {!room.is_global && (
                <button
                  type="button"
                  onClick={() => setInviteOpen(true)}
                  className="flex w-full items-center gap-3 rounded-xl px-2 py-2 text-left hover:bg-gray-50"
                >
                  <span className="flex size-10 items-center justify-center rounded-full bg-mega-secondary/10 text-mega-secondary">
                    <UserPlus className="size-[18px]" />
                  </span>
                  <span className="text-[15px] font-medium text-mega-secondary">대화상대 초대</span>
                </button>
              )}
              <ul>
                {room.members.map((m) => (
                  <li key={m.id} className="flex items-center gap-3 rounded-xl px-2 py-2">
                    <ChatAvatar user={m} className="size-10" />
                    <span className="min-w-0 flex-1">
                      <span className="flex items-center gap-1">
                        <span className="truncate text-[15px] font-medium text-gray-900">
                          {m.name}
                        </span>
                        {m.id === myId && (
                          <span className="rounded bg-gray-100 px-1 text-[10px] font-bold text-gray-500">
                            나
                          </span>
                        )}
                        {m.is_owner && !room.is_global && (
                          <Crown className="size-3.5 shrink-0 text-amber-400" aria-label="방장" />
                        )}
                      </span>
                      <span className="text-xs text-gray-400">{m.position}</span>
                    </span>
                  </li>
                ))}
              </ul>
            </div>

            {!room.is_global && (
              <button
                type="button"
                onClick={() => setLeaveOpen(true)}
                className="flex w-full items-center justify-center gap-2 rounded-2xl bg-white p-4 text-[15px] font-semibold text-red-500 ring-1 ring-black/[0.04] hover:bg-red-50"
              >
                <LogOut className="size-4" />
                채팅방 나가기
              </button>
            )}
          </div>
        </SheetContent>
      </Sheet>

      {!room.is_global && (
        <InviteDialog
          roomId={room.id}
          memberIds={room.members.map((m) => m.id)}
          open={inviteOpen}
          onOpenChange={setInviteOpen}
        />
      )}

      <ConfirmDialog
        open={leaveOpen}
        title="채팅방을 나갈까요?"
        description="나가면 대화 내용이 내 목록에서 사라지고, 다시 초대받아야 참여할 수 있어요."
        confirmLabel="나가기"
        variant="destructive"
        isPending={leave.isPending}
        onCancel={() => setLeaveOpen(false)}
        onConfirm={() =>
          leave.mutate(undefined, {
            onSuccess: () => {
              setLeaveOpen(false);
              onOpenChange(false);
              onLeft();
            },
          })
        }
      />
    </>
  );
};
