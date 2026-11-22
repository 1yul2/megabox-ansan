import { Copy, Download, History, Pencil, Trash2, X } from 'lucide-react';
import { toast } from 'sonner';

import { useChatMessageHistoryQuery } from '../api/queries';
import { formatClock, formatDateDivider } from '../model/format';

import type { ChatMessageDTO } from '../api/dto';

import { Button } from '@/shared/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/shared/components/ui/dialog';
import { Spinner } from '@/shared/components/ui/spinner';
import { cn } from '@/shared/lib/utils';

// ─── 메시지 메뉴 (길게 누르기 / 우클릭 / hover 버튼) ──────────────────────────

type MessageActionsDialogProps = {
  message: ChatMessageDTO;
  isMine: boolean;
  canViewHistory: boolean;
  onClose: () => void;
  onEdit: (message: ChatMessageDTO) => void;
  onDelete: (message: ChatMessageDTO) => void;
  onViewHistory: (message: ChatMessageDTO) => void;
  onOpenImage: (src: string) => void;
  imageSrc?: string;
};

export const MessageActionsDialog = ({
  message,
  isMine,
  canViewHistory,
  onClose,
  onEdit,
  onDelete,
  onViewHistory,
  onOpenImage,
  imageSrc,
}: MessageActionsDialogProps) => {
  const isText = message.message_type === 'text';
  const itemClass =
    'flex w-full items-center gap-3 rounded-lg px-3 py-3 text-left text-sm font-medium text-gray-800 transition-colors hover:bg-gray-50 active:bg-gray-100';

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(message.content);
      toast.success('메시지를 복사했습니다.');
    } catch {
      toast.error('복사하지 못했습니다.');
    }
    onClose();
  };

  return (
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <DialogContent showCloseButton={false} className="max-w-[300px] gap-1 p-2 sm:p-2">
        <div className="border-b border-gray-100 px-3 pt-2 pb-3">
          <DialogTitle className="text-sm font-semibold">메시지</DialogTitle>
          <DialogDescription className="mt-0.5 line-clamp-2 text-xs text-gray-400">
            {isText ? message.content : '사진'}
          </DialogDescription>
        </div>
        {isText && (
          <button type="button" className={itemClass} onClick={() => void copy()}>
            <Copy className="size-4 text-gray-500" />
            복사
          </button>
        )}
        {!isText && imageSrc && (
          <button
            type="button"
            className={itemClass}
            onClick={() => {
              onOpenImage(imageSrc);
              onClose();
            }}
          >
            <Download className="size-4 text-gray-500" />
            크게 보기 · 저장
          </button>
        )}
        {isMine && isText && (
          <button
            type="button"
            className={itemClass}
            onClick={() => {
              onEdit(message);
              onClose();
            }}
          >
            <Pencil className="size-4 text-gray-500" />
            수정
          </button>
        )}
        {canViewHistory && message.is_edited && (
          <button
            type="button"
            className={itemClass}
            onClick={() => {
              onViewHistory(message);
              onClose();
            }}
          >
            <History className="size-4 text-mega" />
            수정 전 내용 보기
          </button>
        )}
        {isMine && (
          <button
            type="button"
            className={cn(itemClass, 'text-danger')}
            onClick={() => {
              onDelete(message);
              onClose();
            }}
          >
            <Trash2 className="size-4" />
            삭제
          </button>
        )}
      </DialogContent>
    </Dialog>
  );
};

// ─── 사진 크게 보기 ────────────────────────────────────────────────────────────

export const ImageViewerDialog = ({
  src,
  onClose,
}: {
  src: string | null;
  onClose: () => void;
}) => (
  <Dialog open={src != null} onOpenChange={(open) => !open && onClose()}>
    <DialogContent
      showCloseButton={false}
      className="max-w-[min(96vw,1100px)] gap-0 border-0 bg-transparent p-0 shadow-none sm:p-0"
    >
      <DialogTitle className="sr-only">사진 보기</DialogTitle>
      <DialogDescription className="sr-only">채팅방에서 보낸 사진</DialogDescription>
      {src && (
        <div className="relative flex flex-col items-center gap-3">
          <img
            src={src}
            alt="채팅 사진"
            className="max-h-[80dvh] w-auto max-w-full rounded-xl bg-white object-contain"
          />
          <div className="flex gap-2">
            <Button asChild variant="outline" size="sm" className="gap-1.5">
              <a href={src} target="_blank" rel="noopener noreferrer" download>
                <Download className="size-4" />
                원본 열기
              </a>
            </Button>
            <Button variant="outline" size="sm" onClick={onClose} className="gap-1.5">
              <X className="size-4" />
              닫기
            </Button>
          </div>
        </div>
      )}
    </DialogContent>
  </Dialog>
);

// ─── 수정 이력 (최고 관리자 전용) ──────────────────────────────────────────────

export const EditHistoryDialog = ({
  roomId,
  messageId,
  onClose,
}: {
  roomId: number;
  messageId: number | null;
  onClose: () => void;
}) => {
  const { data, isLoading, isError } = useChatMessageHistoryQuery(roomId, messageId);

  return (
    <Dialog open={messageId != null} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-md">
        <DialogHeader className="border-b border-border pb-3">
          <DialogTitle className="flex items-center gap-2 text-base font-semibold">
            <History className="size-4 text-mega" />
            수정 이력
          </DialogTitle>
          <DialogDescription className="text-xs">
            최고 관리자에게만 보이는 정보입니다. 위에서부터 처음 작성한 내용 순서입니다.
          </DialogDescription>
        </DialogHeader>

        {isLoading ? (
          <div className="flex justify-center py-8">
            <Spinner className="text-gray-400" />
          </div>
        ) : isError || !data ? (
          <p className="py-8 text-center text-sm text-gray-400">수정 이력을 불러오지 못했습니다.</p>
        ) : (
          <ol className="max-h-[60dvh] space-y-3 overflow-y-auto">
            {data.versions.map((v, i) => (
              <li
                key={i}
                className={cn(
                  'rounded-xl border p-3',
                  v.is_current ? 'border-mega/30 bg-mega-soft' : 'border-gray-200 bg-white',
                )}
              >
                <div className="mb-1.5 flex items-center gap-2 text-[11px]">
                  <span
                    className={cn(
                      'rounded border px-1.5 py-px font-medium',
                      v.is_current
                        ? 'border-navy-200 bg-navy-50 text-navy-700'
                        : 'border-gray-200 bg-gray-50 text-gray-500',
                    )}
                  >
                    {v.is_current ? '현재' : i === 0 ? '원본' : `수정 ${i}`}
                  </span>
                  <span className="text-gray-400">
                    {formatDateDivider(v.created_at)} {formatClock(v.created_at)}
                  </span>
                </div>
                <p className="text-sm whitespace-pre-wrap break-words text-gray-800">{v.content}</p>
              </li>
            ))}
          </ol>
        )}
      </DialogContent>
    </Dialog>
  );
};
