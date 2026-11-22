import { Bell, Check, Crown, LogOut, Pencil, Pin, UserPlus, X } from 'lucide-react';
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

import { getPositionBadgeStyle } from '@/entities/user/model/position';
import { UserProfileTrigger } from '@/entities/user/ui/UserProfileCard';
import { Button } from '@/shared/components/ui/button';
import ConfirmDialog from '@/shared/components/ui/confirm-dialog';
import { Input } from '@/shared/components/ui/input';
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
        <SheetContent side="right" className="flex w-full flex-col gap-0 p-0 sm:max-w-[380px]">
          {/* 헤더 */}
          <div className="flex items-center justify-between border-b border-gray-100 px-4 pt-[max(0.75rem,env(safe-area-inset-top))] pb-3">
            <SheetTitle className="text-base font-semibold">채팅방 정보</SheetTitle>
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={() => onOpenChange(false)}
              aria-label="닫기"
            >
              <X className="size-5" />
            </Button>
          </div>
          <SheetDescription className="sr-only">채팅방 설정과 참여자 목록</SheetDescription>

          <div className="min-h-0 flex-1 space-y-4 overflow-y-auto bg-app-bg p-4 pb-[max(1.5rem,env(safe-area-inset-bottom))]">
            {/* 방 프로필 */}
            <div className="flex flex-col items-center gap-3 rounded-xl border border-gray-200 bg-white p-5 text-center shadow-xs">
              <RoomAvatar
                isGlobal={room.is_global}
                members={others.length ? others : room.members}
                className="size-16"
              />
              {editing ? (
                <div className="flex w-full items-center gap-2">
                  <Input
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
                    className="text-center"
                  />
                  <Button
                    size="icon"
                    onClick={saveName}
                    disabled={rename.isPending}
                    aria-label="저장"
                  >
                    <Check className="size-4" />
                  </Button>
                </div>
              ) : (
                <div className="flex items-center gap-1">
                  <p className="text-base font-bold text-gray-900 break-keep">{room.name}</p>
                  {canRename && (
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      onClick={startEdit}
                      aria-label="이름 변경"
                      className="size-7"
                    >
                      <Pencil className="size-3.5" />
                    </Button>
                  )}
                </div>
              )}
              <p className="-mt-1 text-xs text-gray-500">
                {room.is_global
                  ? '모든 직원이 자동으로 참여하는 채팅방'
                  : `참여자 ${room.member_count}명`}
              </p>
            </div>

            {/* 설정 */}
            <div className="divide-y divide-gray-100 rounded-xl border border-gray-200 bg-white shadow-xs">
              <SettingRow
                icon={<Pin className="size-4 rotate-45" />}
                title="상단 고정"
                description="새 메시지가 와도 목록 맨 위에 유지"
                checked={room.is_pinned}
                disabled={pin.isPending}
                onChange={(v) => pin.mutate({ roomId: room.id, pinned: v })}
              />
              <SettingRow
                icon={<Bell className="size-4" />}
                title="채팅방 알림"
                description="새 메시지 푸시 알림 받기"
                checked={room.notify_enabled}
                disabled={notification.isPending}
                onChange={(v) => notification.mutate(v)}
              />
            </div>

            {/* 참여자 */}
            <div className="rounded-xl border border-gray-200 bg-white shadow-xs">
              <p className="border-b border-gray-100 px-4 py-3 text-sm font-semibold text-gray-800">
                참여자 <span className="text-gray-400">{room.member_count}</span>
              </p>
              {!room.is_global && (
                <button
                  type="button"
                  onClick={() => setInviteOpen(true)}
                  className="flex w-full items-center gap-3 border-b border-gray-100 px-4 py-2.5 text-left transition-colors hover:bg-gray-50"
                >
                  <span className="flex size-9 items-center justify-center rounded-full bg-mega/10 text-mega">
                    <UserPlus className="size-4" />
                  </span>
                  <span className="text-sm font-medium text-mega">대화상대 초대</span>
                </button>
              )}
              <ul className="py-1">
                {room.members.map((m) => (
                  <li key={m.id}>
                    {/* 참여자 클릭 → 프로필 카드 */}
                    <UserProfileTrigger
                      userId={m.id}
                      name={m.name}
                      profileImage={m.profile_image}
                      gender={m.gender}
                      position={m.position}
                      className="flex w-full items-center gap-3 rounded-none px-4 py-2 hover:bg-gray-50 hover:opacity-100"
                    >
                      <ChatAvatar user={m} className="size-9 border border-gray-200" />
                      <span className="flex min-w-0 flex-1 items-center gap-1.5">
                        <span className="truncate text-sm font-medium text-gray-800">{m.name}</span>
                        <span
                          className={cn(
                            'inline-flex shrink-0 items-center rounded border px-1.5 py-0.5 text-[10px] font-medium',
                            getPositionBadgeStyle(m.position),
                          )}
                        >
                          {m.position}
                        </span>
                        {m.id === myId && <span className="text-[11px] text-gray-400">(나)</span>}
                        {m.is_owner && !room.is_global && (
                          <Crown className="size-3.5 shrink-0 text-warning" aria-label="방장" />
                        )}
                      </span>
                    </UserProfileTrigger>
                  </li>
                ))}
              </ul>
            </div>

            {!room.is_global && (
              <Button
                variant="outline"
                onClick={() => setLeaveOpen(true)}
                className="w-full gap-2 text-danger hover:text-danger"
              >
                <LogOut className="size-4" />
                채팅방 나가기
              </Button>
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
        description="나가면 대화 내용이 내 목록에서 사라지고, 다시 초대받아야 참여할 수 있습니다."
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

const SettingRow = ({
  icon,
  title,
  description,
  checked,
  disabled,
  onChange,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  checked: boolean;
  disabled?: boolean;
  onChange: (value: boolean) => void;
}) => (
  <label className="flex cursor-pointer items-center gap-3 px-4 py-3">
    <span
      className={cn(
        'flex size-9 shrink-0 items-center justify-center rounded-lg',
        checked ? 'bg-mega/10 text-mega' : 'bg-gray-100 text-gray-400',
      )}
    >
      {icon}
    </span>
    <span className="min-w-0 flex-1">
      <span className="block text-sm font-medium text-gray-800">{title}</span>
      <span className="text-xs text-gray-400">{description}</span>
    </span>
    <Switch checked={checked} disabled={disabled} onCheckedChange={onChange} aria-label={title} />
  </label>
);
