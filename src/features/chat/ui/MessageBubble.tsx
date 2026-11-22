import { AlertCircle, RotateCw, Trash2 } from 'lucide-react';
import { memo, useRef } from 'react';

import { formatClock, splitLinks } from '../model/format';

import { ChatAvatar } from './ChatAvatar';

import type { ChatMessageDTO } from '../api/dto';

import { cn } from '@/shared/lib/utils';

type MessageBubbleProps = {
  message: ChatMessageDTO;
  isMine: boolean;
  isFirst: boolean;
  isLast: boolean;
  unreadCount: number;
  onRequestDelete?: (message: ChatMessageDTO) => void;
  onRetry?: (message: ChatMessageDTO) => void;
  onAvatarClick?: (message: ChatMessageDTO) => void;
};

const LONG_PRESS_MS = 450;

export const MessageBubble = memo(
  ({
    message,
    isMine,
    isFirst,
    isLast,
    unreadCount,
    onRequestDelete,
    onRetry,
  }: MessageBubbleProps) => {
    const pressTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
    const canDelete = isMine && !message.is_deleted && message.id > 0 && !!onRequestDelete;

    const cancelPress = () => {
      if (pressTimer.current) clearTimeout(pressTimer.current);
      pressTimer.current = null;
    };

    const handlePointerDown = (e: React.PointerEvent) => {
      if (!canDelete || e.pointerType !== 'touch') return;
      cancelPress();
      pressTimer.current = setTimeout(() => {
        navigator.vibrate?.(10);
        onRequestDelete?.(message);
      }, LONG_PRESS_MS);
    };

    const status = message._status;

    const meta = (
      <span
        className={cn(
          'flex shrink-0 flex-col justify-end gap-0.5 pb-0.5 text-[10px] leading-none tabular-nums',
          isMine ? 'items-end' : 'items-start',
        )}
      >
        {status === 'sending' ? (
          <span className="size-3 animate-spin rounded-full border-[1.5px] border-gray-300 border-t-transparent" />
        ) : status === 'failed' ? null : (
          <>
            {unreadCount > 0 && (
              <span className="font-bold text-mega-secondary">{unreadCount}</span>
            )}
            {isLast && <span className="text-gray-400">{formatClock(message.created_at)}</span>}
          </>
        )}
      </span>
    );

    return (
      <div
        className={cn(
          'group flex w-full gap-2 px-3 sm:px-5',
          isMine ? 'justify-end' : 'justify-start',
          isFirst ? 'mt-3' : 'mt-1',
        )}
      >
        {/* 상대 아바타 (연속 메시지 첫 줄만) */}
        {!isMine && (
          <span className="w-9 shrink-0">
            {isFirst && <ChatAvatar user={message.sender} className="size-9 ring-2 ring-white" />}
          </span>
        )}

        <div
          className={cn('flex min-w-0 max-w-[78%] flex-col sm:max-w-[68%]', isMine && 'items-end')}
        >
          {!isMine && isFirst && (
            <span className="mb-1 ml-1 text-xs font-medium text-gray-500">
              {message.sender?.name ?? '알 수 없음'}
            </span>
          )}

          <div className={cn('flex items-end gap-1.5', isMine && 'flex-row-reverse')}>
            <div
              onPointerDown={handlePointerDown}
              onPointerUp={cancelPress}
              onPointerLeave={cancelPress}
              onPointerMove={cancelPress}
              onContextMenu={(e) => {
                if (!canDelete) return;
                e.preventDefault();
                onRequestDelete?.(message);
              }}
              className={cn(
                'relative min-w-0 select-text px-3.5 py-2 text-[15px] leading-relaxed whitespace-pre-wrap break-words [overflow-wrap:anywhere]',
                'animate-in fade-in slide-in-from-bottom-1 duration-200',
                isMine
                  ? 'rounded-[20px] bg-linear-to-br from-mega-secondary to-mega text-white shadow-[0_6px_16px_-8px_rgba(23,43,77,0.55)]'
                  : 'rounded-[20px] bg-white text-gray-900 shadow-[0_1px_2px_rgba(16,24,40,0.06)] ring-1 ring-black/[0.04]',
                isFirst && (isMine ? 'rounded-tr-md' : 'rounded-tl-md'),
                status === 'sending' && 'opacity-70',
                status === 'failed' && 'opacity-60 ring-2 ring-red-300',
                message.is_deleted && 'italic opacity-60',
              )}
            >
              {message.is_deleted
                ? '삭제된 메시지입니다.'
                : splitLinks(message.content).map((part, i) =>
                    part.href ? (
                      <a
                        key={i}
                        href={part.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={cn(
                          'underline underline-offset-2',
                          isMine ? 'text-white' : 'text-mega-secondary',
                        )}
                      >
                        {part.text}
                      </a>
                    ) : (
                      <span key={i}>{part.text}</span>
                    ),
                  )}
            </div>

            {meta}

            {/* 데스크탑 hover 삭제 버튼 */}
            {canDelete && (
              <button
                type="button"
                onClick={() => onRequestDelete?.(message)}
                aria-label="메시지 삭제"
                className="mb-1 hidden size-7 shrink-0 items-center justify-center rounded-full text-gray-300 opacity-0 transition hover:bg-red-50 hover:text-red-500 group-hover:opacity-100 focus-visible:opacity-100 [@media(hover:hover)]:flex"
              >
                <Trash2 className="size-3.5" />
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
    <span className="rounded-full bg-black/[0.045] px-3 py-1 text-center text-[11.5px] text-gray-500 backdrop-blur-sm">
      {content}
    </span>
  </div>
);

export const DateDivider = ({ label }: { label: string }) => (
  <div className="sticky top-2 z-10 my-4 flex justify-center">
    <span className="rounded-full bg-white/75 px-3 py-1 text-[11px] font-medium text-gray-500 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.12)] ring-1 ring-black/[0.04] backdrop-blur-xl">
      {label}
    </span>
  </div>
);

export const TypingBubble = ({ names }: { names: string[] }) => {
  if (names.length === 0) return null;
  const label =
    names.length === 1
      ? `${names[0]}님이 입력 중`
      : `${names[0]}님 외 ${names.length - 1}명이 입력 중`;
  return (
    <div className="mt-3 flex items-center gap-2 px-3 sm:px-5 animate-in fade-in slide-in-from-bottom-1 duration-200">
      <span className="flex h-8 items-center gap-1 rounded-[18px] rounded-tl-md bg-white px-3.5 ring-1 ring-black/[0.04]">
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
