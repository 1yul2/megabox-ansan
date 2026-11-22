import { Users } from 'lucide-react';

import type { ChatUserDTO } from '../api/dto';

import { getAvatarSrc } from '@/shared/lib/avatar';
import { cn } from '@/shared/lib/utils';

type ChatAvatarProps = {
  user: Pick<ChatUserDTO, 'name' | 'profile_image' | 'gender'> | null;
  className?: string;
};

export const ChatAvatar = ({ user, className }: ChatAvatarProps) => {
  const src = user ? getAvatarSrc(user.profile_image, user.gender) : undefined;
  return (
    <span
      className={cn(
        'flex shrink-0 items-center justify-center overflow-hidden rounded-full bg-mega-light text-mega-secondary',
        className,
      )}
    >
      {src ? (
        <img src={src} alt="" loading="lazy" className="size-full object-cover" />
      ) : (
        <span className="text-[0.8em] font-bold">{user?.name.charAt(0) ?? '?'}</span>
      )}
    </span>
  );
};

type RoomAvatarProps = {
  isGlobal: boolean;
  members: ChatUserDTO[];
  className?: string;
};

/** 채팅방 대표 이미지 — 전체방은 그라디언트 아이콘, 1:1은 상대 사진, 그룹은 2×2 모자이크 */
export const RoomAvatar = ({ isGlobal, members, className }: RoomAvatarProps) => {
  if (isGlobal) {
    return (
      <span
        className={cn(
          'relative flex size-12 shrink-0 items-center justify-center rounded-[18px] text-white',
          'bg-linear-to-br from-mega-secondary via-[#4b7bb5] to-mega shadow-[0_6px_18px_-6px_rgba(49,95,145,0.6)]',
          className,
        )}
      >
        <Users className="size-[45%]" strokeWidth={2.2} />
      </span>
    );
  }

  if (members.length <= 1) {
    return (
      <ChatAvatar user={members[0] ?? null} className={cn('size-12 rounded-[18px]', className)} />
    );
  }

  const shown = members.slice(0, 4);
  return (
    <span
      className={cn(
        'grid size-12 shrink-0 gap-px overflow-hidden rounded-[18px] bg-white ring-1 ring-black/5',
        shown.length === 2 ? 'grid-cols-2' : 'grid-cols-2 grid-rows-2',
        className,
      )}
    >
      {shown.map((m, i) => (
        <ChatAvatar
          key={m.id}
          user={m}
          className={cn(
            'size-full rounded-none text-[10px]',
            shown.length === 3 && i === 0 && 'row-span-2',
          )}
        />
      ))}
    </span>
  );
};
