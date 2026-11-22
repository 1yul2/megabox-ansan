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
        'flex shrink-0 items-center justify-center overflow-hidden rounded-full bg-mega-secondary/10 text-mega-secondary',
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

/** 채팅방 대표 이미지 — 전체방은 아이콘 타일(PageHeader 스타일), 1:1은 상대 사진, 그룹은 2×2 모자이크 */
export const RoomAvatar = ({ isGlobal, members, className }: RoomAvatarProps) => {
  if (isGlobal) {
    return (
      <span
        className={cn(
          'flex size-11 shrink-0 items-center justify-center rounded-xl bg-mega/10 text-mega',
          className,
        )}
      >
        <Users className="size-[45%]" />
      </span>
    );
  }

  if (members.length <= 1) {
    return <ChatAvatar user={members[0] ?? null} className={cn('size-11', className)} />;
  }

  const shown = members.slice(0, 4);
  return (
    <span
      className={cn(
        'grid size-11 shrink-0 gap-px overflow-hidden rounded-xl border border-gray-200 bg-gray-200',
        shown.length === 2 ? 'grid-cols-2' : 'grid-cols-2 grid-rows-2',
        className,
      )}
    >
      {shown.map((m, i) => (
        <ChatAvatar
          key={m.id}
          user={m}
          className={cn(
            'size-full rounded-none bg-mega-soft text-[10px]',
            shown.length === 3 && i === 0 && 'row-span-2',
          )}
        />
      ))}
    </span>
  );
};
