import { AlertCircle, ImageOff, MoreHorizontal, RotateCw } from 'lucide-react';
import { memo, useRef, useState } from 'react';

import { formatClock, splitLinks } from '../model/format';

import { ChatAvatar } from './ChatAvatar';

import type { ChatMessageDTO } from '../api/dto';

import { UserProfileTrigger } from '@/entities/user/ui/UserProfileCard';
import { getUploadUrl } from '@/shared/lib/avatar';
import { cn } from '@/shared/lib/utils';

type MessageBubbleProps = {
  message: ChatMessageDTO;
  isMine: boolean;
  isFirst: boolean;
  isLast: boolean;
  unreadCount: number;
  /** 최고 관리자: '수정됨' 클릭 시 수정 이력 열람 */
  canViewHistory?: boolean;
  onOpenActions?: (message: ChatMessageDTO) => void;
  onOpenImage?: (src: string) => void;
  onViewHistory?: (message: ChatMessageDTO) => void;
  onRetry?: (message: ChatMessageDTO) => void;
};

const LONG_PRESS_MS = 450;
const IMAGE_MAX_W = 240;
const IMAGE_MAX_H = 320;

/** 원본 비율을 유지한 말풍선 이미지 크기 (로드 전 자리 확보 → 스크롤 튐 방지) */
function imageBox(w?: number | null, h?: number | null) {
  if (!w || !h) return { width: IMAGE_MAX_W, height: 180 };
  const scale = Math.min(1, IMAGE_MAX_W / w, IMAGE_MAX_H / h);
  return {
    width: Math.max(96, Math.round(w * scale)),
    height: Math.max(72, Math.round(h * scale)),
  };
}

export const MessageBubble = memo(
  ({
    message,
    isMine,
    isFirst,
    isLast,
    unreadCount,
    canViewHistory,
    onOpenActions,
    onOpenImage,
    onViewHistory,
    onRetry,
  }: MessageBubbleProps) => {
    const pressTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
    const longPressed = useRef(false);
    const [imgError, setImgError] = useState(false);
    const sender = message.sender;
    const status = message._status;
    const isImage = message.message_type === 'image';
    const hasActions = message.id > 0 && !message.is_deleted && !!onOpenActions;

    const cancelPress = () => {
      if (pressTimer.current) clearTimeout(pressTimer.current);
      pressTimer.current = null;
    };

    // 모바일: 길게 눌러 메뉴 (복사·수정·삭제)
    const handlePointerDown = (e: React.PointerEvent) => {
      if (!hasActions || e.pointerType !== 'touch') return;
      longPressed.current = false;
      cancelPress();
      pressTimer.current = setTimeout(() => {
        longPressed.current = true;
        navigator.vibrate?.(10);
        onOpenActions?.(message);
      }, LONG_PRESS_MS);
    };

    const pressHandlers = {
      onPointerDown: handlePointerDown,
      onPointerUp: cancelPress,
      onPointerLeave: cancelPress,
      onPointerMove: cancelPress,
      onContextMenu: (e: React.MouseEvent) => {
        if (!hasActions) return;
        e.preventDefault();
        onOpenActions?.(message);
      },
    };

    const imageSrc = message._localUrl ?? getUploadUrl(message.attachment_url);
    const box = imageBox(message.attachment_width, message.attachment_height);

    const body = message.is_deleted ? (
      <div
        className={cn(
          'rounded-2xl px-3.5 py-2 text-sm italic',
          isMine ? 'bg-mega/60 text-white' : 'border border-gray-200 bg-white text-gray-400',
        )}
      >
        삭제된 메시지입니다.
      </div>
    ) : isImage ? (
      <button
        type="button"
        {...pressHandlers}
        onClick={() => {
          if (longPressed.current) {
            longPressed.current = false;
            return;
          }
          if (imageSrc && !imgError && !status) onOpenImage?.(imageSrc);
        }}
        aria-label="사진 크게 보기"
        className={cn(
          'relative block overflow-hidden rounded-2xl border border-gray-200 bg-gray-100',
          isFirst && (isMine ? 'rounded-tr-sm' : 'rounded-tl-sm'),
          status === 'failed' && 'outline-2 outline-red-300',
        )}
        style={{ width: box.width, height: box.height }}
      >
        {imageSrc && !imgError ? (
          <img
            src={imageSrc}
            alt="보낸 사진"
            loading="lazy"
            draggable={false}
            onError={() => setImgError(true)}
            className={cn('size-full object-cover', status === 'sending' && 'opacity-60')}
          />
        ) : (
          <span className="flex size-full flex-col items-center justify-center gap-1 text-xs text-gray-400">
            <ImageOff className="size-5" />
            사진을 불러올 수 없습니다
          </span>
        )}
        {status === 'sending' && (
          <span className="absolute inset-0 flex items-center justify-center">
            <span className="size-6 animate-spin rounded-full border-2 border-white border-t-transparent" />
          </span>
        )}
      </button>
    ) : (
      <div
        {...pressHandlers}
        className={cn(
          'min-w-0 rounded-2xl px-3.5 py-2 text-sm leading-relaxed whitespace-pre-wrap break-words [overflow-wrap:anywhere]',
          isMine ? 'bg-mega text-white' : 'border border-gray-200 bg-white text-gray-800 shadow-xs',
          isFirst && (isMine ? 'rounded-tr-sm' : 'rounded-tl-sm'),
          status === 'sending' && 'opacity-60',
          status === 'failed' && 'opacity-60 outline-2 outline-red-300',
        )}
      >
        {splitLinks(message.content).map((part, i) =>
          part.href ? (
            <a
              key={i}
              href={part.href}
              target="_blank"
              rel="noopener noreferrer"
              className={cn(
                'underline underline-offset-2',
                isMine ? 'text-ice-soft' : 'text-mega-secondary',
              )}
            >
              {part.text}
            </a>
          ) : (
            <span key={i}>{part.text}</span>
          ),
        )}
      </div>
    );

    return (
      <div
        className={cn(
          'group flex w-full gap-2 px-3 sm:px-5 [@media(pointer:coarse)]:select-none [-webkit-touch-callout:none]',
          isMine ? 'justify-end' : 'justify-start',
          isFirst ? 'mt-3' : 'mt-1',
        )}
      >
        {/* 상대 아바타 (연속 메시지 첫 줄만) — 클릭 시 프로필 카드 */}
        {!isMine && (
          <span className="w-9 shrink-0">
            {isFirst &&
              (sender ? (
                <UserProfileTrigger
                  userId={sender.id}
                  name={sender.name}
                  profileImage={sender.profile_image}
                  gender={sender.gender}
                  position={sender.position}
                  className="rounded-full"
                >
                  <ChatAvatar user={sender} className="size-9 border border-gray-200" />
                </UserProfileTrigger>
              ) : (
                <ChatAvatar user={null} className="size-9 border border-gray-200" />
              ))}
          </span>
        )}

        <div
          className={cn('flex min-w-0 max-w-[78%] flex-col sm:max-w-[65%]', isMine && 'items-end')}
        >
          {!isMine && isFirst && (
            <span className="mb-1 ml-0.5 text-xs font-medium text-gray-600">
              {sender?.name ?? '알 수 없음'}
            </span>
          )}

          <div className={cn('flex items-end gap-1.5', isMine && 'flex-row-reverse')}>
            {body}

            {/* 안 읽은 사람 수 · 수정됨 · 시간 */}
            <span
              className={cn(
                'flex shrink-0 flex-col justify-end gap-0.5 pb-0.5 text-[10px] leading-none tabular-nums',
                isMine ? 'items-end' : 'items-start',
              )}
            >
              {status === 'sending' ? (
                !isImage && (
                  <span className="size-3 animate-spin rounded-full border-[1.5px] border-gray-300 border-t-transparent" />
                )
              ) : status === 'failed' ? null : (
                <>
                  {unreadCount > 0 && (
                    <span className="font-semibold text-warning">{unreadCount}</span>
                  )}
                  {message.is_edited &&
                    (canViewHistory ? (
                      <button
                        type="button"
                        onClick={() => onViewHistory?.(message)}
                        className="text-mega-secondary underline underline-offset-2 hover:text-mega"
                        title="수정 전 내용 보기"
                      >
                        수정됨
                      </button>
                    ) : (
                      <span className="text-gray-400">수정됨</span>
                    ))}
                  {isLast && (
                    <span className="text-gray-400">{formatClock(message.created_at)}</span>
                  )}
                </>
              )}
            </span>

            {/* 데스크탑 hover 메뉴 버튼 */}
            {hasActions && (
              <button
                type="button"
                onClick={() => onOpenActions?.(message)}
                aria-label="메시지 메뉴"
                className="mb-0.5 hidden size-7 shrink-0 items-center justify-center rounded-lg text-gray-400 opacity-0 transition hover:bg-gray-100 hover:text-gray-700 group-hover:opacity-100 focus-visible:opacity-100 [@media(hover:hover)]:flex"
              >
                <MoreHorizontal className="size-4" />
              </button>
            )}
          </div>

          {status === 'failed' && (
            <button
              type="button"
              onClick={() => onRetry?.(message)}
              className="mt-1 inline-flex items-center gap-1 text-[11px] font-medium text-red-500"
            >
              <AlertCircle className="size-3" />
              전송 실패 · 다시 보내기
              <RotateCw className="size-3" />
            </button>
          )}
        </div>
      </div>
    );
  },
);
MessageBubble.displayName = 'MessageBubble';

export const SystemMessage = ({ content }: { content: string }) => (
  <div className="my-3 flex justify-center px-6">
    <span className="rounded-full bg-gray-200/60 px-3 py-1 text-center text-[11px] text-gray-500">
      {content}
    </span>
  </div>
);

export const DateDivider = ({ label }: { label: string }) => (
  <div className="my-4 flex items-center gap-3 px-5">
    <span className="h-px flex-1 bg-gray-200" />
    <span className="text-[11px] font-medium text-gray-400">{label}</span>
    <span className="h-px flex-1 bg-gray-200" />
  </div>
);

export const TypingBubble = ({ names }: { names: string[] }) => {
  if (names.length === 0) return null;
  const label =
    names.length === 1
      ? `${names[0]}님이 입력 중`
      : `${names[0]}님 외 ${names.length - 1}명이 입력 중`;
  return (
    <div className="mt-3 flex items-center gap-2 px-3 sm:px-5">
      <span className="flex h-8 items-center gap-1 rounded-2xl rounded-tl-sm border border-gray-200 bg-white px-3.5">
        {[0, 1, 2].map((i) => (
          <span
            key={i}
            className="size-1.5 animate-bounce rounded-full bg-gray-400"
            style={{ animationDelay: `${i * 140}ms`, animationDuration: '1s' }}
          />
        ))}
      </span>
      <span className="text-[11px] text-gray-400">{label}</span>
    </div>
  );
};
