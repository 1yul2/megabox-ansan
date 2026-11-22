import { useState } from 'react';

import { useCreateChatRoomMutation, useInviteChatMutation } from '../api/queries';

import { UserPicker } from './UserPicker';

import type { ChatUserDTO } from '../api/dto';

import { Button } from '@/shared/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/shared/components/ui/dialog';
import { Spinner } from '@/shared/components/ui/spinner';

type CreateRoomDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreated: (roomId: number) => void;
};

export const CreateRoomDialog = ({ open, onOpenChange, onCreated }: CreateRoomDialogProps) => {
  const [selected, setSelected] = useState<ChatUserDTO[]>([]);
  const [name, setName] = useState('');
  const { mutate, isPending } = useCreateChatRoomMutation();

  const handleOpenChange = (next: boolean) => {
    if (!next) {
      setSelected([]);
      setName('');
    }
    onOpenChange(next);
  };

  const submit = () => {
    mutate(
      { name: name.trim() || undefined, member_ids: selected.map((u) => u.id) },
      {
        onSuccess: (room) => {
          setSelected([]);
          setName('');
          onCreated(room.id);
        },
      },
    );
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-md gap-4 rounded-3xl">
        <DialogHeader className="text-left">
          <DialogTitle className="text-lg font-bold">새 채팅방</DialogTitle>
          <DialogDescription className="text-xs">
            대화할 직원을 선택하세요. 방 이름은 비워두면 참여자 이름으로 표시돼요.
          </DialogDescription>
        </DialogHeader>

        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          maxLength={100}
          placeholder="채팅방 이름 (선택)"
          className="h-11 rounded-xl bg-gray-50 px-3.5 text-[15px] outline-none ring-1 ring-black/[0.05] placeholder:text-gray-400 focus:ring-2 focus:ring-mega-secondary/30"
        />

        <UserPicker selected={selected} onChange={setSelected} />

        <Button
          type="button"
          onClick={submit}
          disabled={selected.length === 0 || isPending}
          className="h-12 rounded-2xl bg-linear-to-r from-mega to-mega-secondary text-[15px] font-semibold"
        >
          {isPending ? (
            <Spinner />
          ) : (
            `${selected.length > 0 ? `${selected.length}명과 ` : ''}채팅 시작`
          )}
        </Button>
      </DialogContent>
    </Dialog>
  );
};

type InviteDialogProps = {
  roomId: number;
  memberIds: number[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export const InviteDialog = ({ roomId, memberIds, open, onOpenChange }: InviteDialogProps) => {
  const [selected, setSelected] = useState<ChatUserDTO[]>([]);
  const { mutate, isPending } = useInviteChatMutation(roomId);

  const handleOpenChange = (next: boolean) => {
    if (!next) setSelected([]);
    onOpenChange(next);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-md gap-4 rounded-3xl">
        <DialogHeader className="text-left">
          <DialogTitle className="text-lg font-bold">대화상대 초대</DialogTitle>
          <DialogDescription className="text-xs">
            초대된 사람은 초대 이후의 대화부터 볼 수 있어요.
          </DialogDescription>
        </DialogHeader>
        <UserPicker selected={selected} onChange={setSelected} excludeIds={memberIds} />
        <Button
          type="button"
          disabled={selected.length === 0 || isPending}
          onClick={() =>
            mutate(
              selected.map((u) => u.id),
              { onSuccess: () => handleOpenChange(false) },
            )
          }
          className="h-12 rounded-2xl bg-linear-to-r from-mega to-mega-secondary text-[15px] font-semibold"
        >
          {isPending ? <Spinner /> : `${selected.length}명 초대하기`}
        </Button>
      </DialogContent>
    </Dialog>
  );
};
