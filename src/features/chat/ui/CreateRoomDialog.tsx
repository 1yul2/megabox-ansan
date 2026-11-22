import { useState } from 'react';

import { useCreateChatRoomMutation, useInviteChatMutation } from '../api/queries';

import { UserPicker } from './UserPicker';

import type { ChatUserDTO } from '../api/dto';

import { Button } from '@/shared/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/shared/components/ui/dialog';
import { Input } from '@/shared/components/ui/input';
import { Label } from '@/shared/components/ui/label';
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

  const reset = () => {
    setSelected([]);
    setName('');
  };

  const handleOpenChange = (next: boolean) => {
    if (!next) reset();
    onOpenChange(next);
  };

  const submit = () => {
    mutate(
      { name: name.trim() || undefined, member_ids: selected.map((u) => u.id) },
      {
        onSuccess: (room) => {
          reset();
          onCreated(room.id);
        },
      },
    );
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader className="border-b border-border pb-3">
          <DialogTitle className="text-base font-semibold">새 채팅</DialogTitle>
          <DialogDescription className="text-xs">
            대화할 직원을 선택하세요. 방 이름을 비워두면 참여자 이름으로 표시됩니다.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-1.5">
          <Label htmlFor="chat-room-name" className="text-xs font-medium">
            채팅방 이름 <span className="text-gray-400">(선택)</span>
          </Label>
          <Input
            id="chat-room-name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            maxLength={100}
            placeholder="예) 오픈조"
          />
        </div>

        <UserPicker selected={selected} onChange={setSelected} />

        <DialogFooter>
          <Button variant="outline" onClick={() => handleOpenChange(false)}>
            취소
          </Button>
          <Button onClick={submit} disabled={selected.length === 0 || isPending}>
            {isPending ? (
              <Spinner />
            ) : selected.length > 0 ? (
              `${selected.length}명과 채팅 시작`
            ) : (
              '채팅 시작'
            )}
          </Button>
        </DialogFooter>
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
      <DialogContent className="max-w-md">
        <DialogHeader className="border-b border-border pb-3">
          <DialogTitle className="text-base font-semibold">대화상대 초대</DialogTitle>
          <DialogDescription className="text-xs">
            초대된 사람은 초대 이후의 대화부터 볼 수 있습니다.
          </DialogDescription>
        </DialogHeader>
        <UserPicker selected={selected} onChange={setSelected} excludeIds={memberIds} />
        <DialogFooter>
          <Button variant="outline" onClick={() => handleOpenChange(false)}>
            취소
          </Button>
          <Button
            disabled={selected.length === 0 || isPending}
            onClick={() =>
              mutate(
                selected.map((u) => u.id),
                { onSuccess: () => handleOpenChange(false) },
              )
            }
          >
            {isPending ? <Spinner /> : `${selected.length}명 초대`}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
