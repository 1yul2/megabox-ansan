import { Cake, Phone } from 'lucide-react';
import { useState } from 'react';

import { useUserCardQuery } from '../api/queries';
import { ROLE_STYLES } from '../model/role';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from '@/shared/components/ui/dialog';
import { getAvatarSrc } from '@/shared/lib/avatar';
import { cn } from '@/shared/lib/utils';

// ─── 유틸 ─────────────────────────────────────────────────────────────────────

/** YYYY-MM-DD → 1999년 4월 17일 */
const formatBirthDate = (value?: string | null): string | null => {
  if (!value) return null;
  const [y, m, d] = value.split('-').map(Number);
  if (!y || !m || !d) return value;
  return `${y}년 ${m}월 ${d}일`;
};

const toTelHref = (phone: string) => `tel:${phone.replace(/[^0-9+]/g, '')}`;

// ─── 프로필 카드 다이얼로그 ───────────────────────────────────────────────────

type UserProfileCardDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  userId: number;
  /** 조회 전 즉시 보여줄 기본 정보 (게시글/댓글에 이미 있는 값) */
  fallbackName: string;
  fallbackProfileImage?: string | null;
  fallbackGender?: string | null;
  fallbackPosition?: string | null;
};

export const UserProfileCardDialog = ({
  open,
  onOpenChange,
  userId,
  fallbackName,
  fallbackProfileImage,
  fallbackGender,
  fallbackPosition,
}: UserProfileCardDialogProps) => {
  const { data, isLoading, isError } = useUserCardQuery(userId, open);

  const name = data?.name ?? fallbackName;
  const position = data?.position ?? fallbackPosition ?? '';
  const avatarUrl = getAvatarSrc(
    data ? data.profile_image : fallbackProfileImage,
    data?.gender ?? fallbackGender,
  );
  const birthDate = formatBirthDate(data?.birth_date);
  const phone = data?.phone ?? null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[340px] gap-0 overflow-hidden p-0 sm:p-0">
        {/* 상단 배경 */}
        <div className="h-24 bg-linear-to-br from-mega-secondary/25 via-mega-light to-mega-soft" />

        {/* 프로필 사진 + 이름 */}
        <div className="-mt-16 flex flex-col items-center px-5 text-center">
          <div className="flex size-32 items-center justify-center overflow-hidden rounded-full bg-mega-soft ring-4 ring-white shadow-lg">
            {avatarUrl ? (
              <img src={avatarUrl} alt={name} className="size-full object-cover" />
            ) : (
              <span className="text-4xl font-bold text-mega-secondary">{name.charAt(0)}</span>
            )}
          </div>

          <DialogTitle className="mt-3 text-xl font-bold leading-tight text-gray-900 break-keep">
            {name}
          </DialogTitle>
          {position && (
            <span
              className={cn(
                'mt-1.5 rounded-md border px-2 py-0.5 text-[11px] font-medium',
                ROLE_STYLES[position] ?? 'border-gray-200 bg-gray-100 text-gray-600',
              )}
            >
              {position}
            </span>
          )}
          <DialogDescription className="sr-only">{name}님의 프로필 카드</DialogDescription>
        </div>

        {/* 연락처 / 생년월일 */}
        <div className="mt-5 space-y-2 px-5 pb-5">
          {isError ? (
            <p className="rounded-xl bg-gray-50 py-4 text-center text-sm text-gray-400">
              프로필 정보를 불러오지 못했습니다.
            </p>
          ) : (
            <>
              <InfoRow
                icon={<Phone className="size-4" />}
                label="연락처"
                isLoading={isLoading}
                value={
                  phone ? (
                    <a
                      href={toTelHref(phone)}
                      className="font-mono tabular-nums text-mega-secondary hover:underline"
                    >
                      {phone}
                    </a>
                  ) : null
                }
              />
              <InfoRow
                icon={<Cake className="size-4" />}
                label="생년월일"
                isLoading={isLoading}
                value={birthDate ? <span className="tabular-nums">{birthDate}</span> : null}
              />
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

type InfoRowProps = {
  icon: React.ReactNode;
  label: string;
  value: React.ReactNode | null;
  isLoading: boolean;
};

const InfoRow = ({ icon, label, value, isLoading }: InfoRowProps) => (
  <div className="flex items-center gap-3 rounded-xl bg-gray-50 px-3.5 py-3">
    <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-white text-mega-secondary shadow-sm">
      {icon}
    </span>
    <div className="min-w-0 flex-1 text-left">
      <p className="text-[11px] font-medium text-gray-400">{label}</p>
      {isLoading ? (
        <div className="mt-1 h-4 w-28 animate-pulse rounded bg-gray-200" />
      ) : (
        <div className="truncate text-sm font-semibold text-gray-800">
          {value ?? <span className="font-normal text-gray-300">미등록</span>}
        </div>
      )}
    </div>
  </div>
);

// ─── 트리거 ───────────────────────────────────────────────────────────────────

type UserProfileTriggerProps = {
  userId: number;
  name: string;
  profileImage?: string | null;
  gender?: string | null;
  position?: string | null;
  className?: string;
  children: React.ReactNode;
};

/**
 * 아바타/이름을 감싸 클릭 시 프로필 카드를 띄운다.
 * - 카드(게시글 목록 등) 내부에서 사용해도 부모 onClick(상세 이동)이 실행되지 않도록 이벤트 전파를 막는다.
 *   (Radix Portal 안의 이벤트도 React 트리를 따라 버블링되므로 다이얼로그까지 감싸서 차단)
 */
export const UserProfileTrigger = ({
  userId,
  name,
  profileImage,
  gender,
  position,
  className,
  children,
}: UserProfileTriggerProps) => {
  const [open, setOpen] = useState(false);

  const stop = (e: React.SyntheticEvent) => e.stopPropagation();

  return (
    <span className="contents" onClick={stop} onKeyDown={stop}>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label={`${name} 프로필 보기`}
        className={cn(
          'inline-flex min-w-0 items-center rounded-md text-left transition-opacity hover:opacity-80',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-mega-secondary/40',
          className,
        )}
      >
        {children}
      </button>
      <UserProfileCardDialog
        open={open}
        onOpenChange={setOpen}
        userId={userId}
        fallbackName={name}
        fallbackProfileImage={profileImage}
        fallbackGender={gender}
        fallbackPosition={position}
      />
    </span>
  );
};
