import { Check, ImagePlus, Pencil, SendHorizontal, X } from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';
import { toast } from 'sonner';

import { MAX_IMAGES_PER_SEND } from '../model/image';

import { Button } from '@/shared/components/ui/button';
import { cn } from '@/shared/lib/utils';

export type EditingMessage = { id: number; content: string };

type ChatComposerProps = {
  onSend: (text: string) => void;
  onSendImages: (files: File[]) => void;
  onTyping?: () => void;
  disabled?: boolean;
  /** 방이 바뀌면 입력창 초기화 + 포커스 */
  resetKey?: number;
  /** 수정 모드 */
  editing: EditingMessage | null;
  onSubmitEdit: (id: number, text: string) => void;
  onCancelEdit: () => void;
};

const MAX_LENGTH = 2000;
const TYPING_THROTTLE = 2500;

/** 터치 기기에서는 Enter = 줄바꿈 (전송은 버튼), 키보드 기기에서는 Enter = 전송 / Shift+Enter = 줄바꿈 */
const isCoarsePointer = () =>
  typeof window !== 'undefined' && window.matchMedia('(pointer: coarse)').matches;

export const ChatComposer = ({
  onSend,
  onSendImages,
  onTyping,
  disabled,
  resetKey,
  editing,
  onSubmitEdit,
  onCancelEdit,
}: ChatComposerProps) => {
  const [text, setText] = useState('');
  const [files, setFiles] = useState<File[]>([]);
  const ref = useRef<HTMLTextAreaElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const lastTyping = useRef(0);
  const draftBeforeEdit = useRef('');

  useEffect(() => {
    setText('');
    setFiles([]);
    if (!isCoarsePointer()) ref.current?.focus();
  }, [resetKey]);

  // 수정 모드 진입/종료 — 기존 입력 중이던 내용은 보관했다가 복원
  useEffect(() => {
    if (editing) {
      draftBeforeEdit.current = text;
      setText(editing.content);
      setFiles([]);
      requestAnimationFrame(() => {
        const el = ref.current;
        if (!el) return;
        el.focus();
        el.setSelectionRange(el.value.length, el.value.length);
      });
    } else {
      setText(draftBeforeEdit.current);
      draftBeforeEdit.current = '';
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editing?.id]);

  // 내용에 맞춰 높이 자동 조절 (최대 약 5줄)
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = `${Math.min(el.scrollHeight, 128)}px`;
  }, [text]);

  // 선택한 사진 미리보기 URL
  const previews = useMemo(() => files.map((f) => URL.createObjectURL(f)), [files]);
  useEffect(() => () => previews.forEach((u) => URL.revokeObjectURL(u)), [previews]);

  const trimmed = text.trim();
  const canSend =
    !disabled && (editing ? trimmed.length > 0 : trimmed.length > 0 || files.length > 0);

  const send = () => {
    if (!canSend) return;
    if (editing) {
      onSubmitEdit(editing.id, trimmed);
      return;
    }
    if (files.length) onSendImages(files);
    if (trimmed) onSend(trimmed);
    setText('');
    setFiles([]);
    // 모바일에서 전송 후 키보드가 내려가지 않도록 포커스 유지
    ref.current?.focus();
  };

  const handleChange = (value: string) => {
    setText(value.slice(0, MAX_LENGTH));
    const now = Date.now();
    if (!editing && value && now - lastTyping.current > TYPING_THROTTLE) {
      lastTyping.current = now;
      onTyping?.();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    // 한글 IME 조합 중 Enter 는 글자 확정이므로 무시
    if (e.nativeEvent.isComposing || e.keyCode === 229) return;
    if (e.key === 'Escape' && editing) {
      e.preventDefault();
      onCancelEdit();
      return;
    }
    if (e.key === 'Enter' && !e.shiftKey && !isCoarsePointer()) {
      e.preventDefault();
      send();
    }
  };

  const addFiles = (list: FileList | File[]) => {
    const images = Array.from(list).filter((f) => f.type.startsWith('image/'));
    if (images.length === 0) return;
    setFiles((prev) => {
      const next = [...prev, ...images];
      if (next.length > MAX_IMAGES_PER_SEND) {
        toast.error(`사진은 한 번에 ${MAX_IMAGES_PER_SEND}장까지 보낼 수 있습니다.`);
      }
      return next.slice(0, MAX_IMAGES_PER_SEND);
    });
  };

  // PC: 클립보드 이미지 붙여넣기 지원
  const handlePaste = (e: React.ClipboardEvent<HTMLTextAreaElement>) => {
    if (editing) return;
    const pasted = Array.from(e.clipboardData.files);
    if (pasted.some((f) => f.type.startsWith('image/'))) {
      e.preventDefault();
      addFiles(pasted);
    }
  };

  return (
    <div className="border-t border-gray-100 bg-white px-3 pt-2.5 pb-[max(0.625rem,env(safe-area-inset-bottom))] sm:px-4">
      {/* 수정 모드 안내 */}
      {editing && (
        <div className="mb-2 flex items-center gap-2 rounded-lg border border-navy-200 bg-navy-50 px-3 py-2 text-xs text-navy-700">
          <Pencil className="size-3.5 shrink-0" />
          <span className="min-w-0 flex-1 truncate">
            <span className="font-semibold">메시지 수정 중</span>
            <span className="ml-1.5 text-navy-700/70">{editing.content}</span>
          </span>
          <button
            type="button"
            onClick={onCancelEdit}
            aria-label="수정 취소"
            className="flex size-6 shrink-0 items-center justify-center rounded hover:bg-navy-100"
          >
            <X className="size-3.5" />
          </button>
        </div>
      )}

      {/* 선택한 사진 미리보기 */}
      {files.length > 0 && (
        <div className="mb-2 flex gap-2 overflow-x-auto pb-1">
          {previews.map((src, i) => (
            <div
              key={src}
              className="relative size-16 shrink-0 overflow-hidden rounded-lg border border-gray-200 bg-gray-100"
            >
              <img src={src} alt="" className="size-full object-cover" />
              <button
                type="button"
                onClick={() => setFiles((prev) => prev.filter((_, idx) => idx !== i))}
                aria-label="사진 빼기"
                className="absolute top-0.5 right-0.5 flex size-5 items-center justify-center rounded-full bg-gray-900/70 text-white"
              >
                <X className="size-3" />
              </button>
            </div>
          ))}
          <span className="self-end pb-1 text-[11px] text-gray-400 tabular-nums">
            {files.length}/{MAX_IMAGES_PER_SEND}
          </span>
        </div>
      )}

      <div className="flex items-end gap-2">
        {!editing && (
          <>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              rounded="lg"
              disabled={disabled}
              onClick={() => fileRef.current?.click()}
              onPointerDown={(e) => e.preventDefault()}
              aria-label="사진 보내기"
              className="shrink-0 text-gray-500"
            >
              <ImagePlus className="size-5" />
            </Button>
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              multiple
              className="hidden"
              onChange={(e) => {
                if (e.target.files) addFiles(e.target.files);
                e.target.value = '';
              }}
            />
          </>
        )}
        <textarea
          ref={ref}
          rows={1}
          value={text}
          disabled={disabled}
          onChange={(e) => handleChange(e.target.value)}
          onKeyDown={handleKeyDown}
          onPaste={handlePaste}
          placeholder={editing ? '수정할 내용을 입력하세요' : '메시지를 입력하세요'}
          enterKeyHint={editing ? 'done' : 'send'}
          aria-label="메시지 입력"
          className={cn(
            'max-h-[128px] min-h-10 flex-1 resize-none rounded-xl border border-gray-200 bg-gray-50 px-3.5 py-2 text-base leading-6 outline-none sm:text-sm',
            'placeholder:text-gray-400 transition-colors focus:border-mega-secondary/50 focus:bg-white focus:ring-[3px] focus:ring-ring/20 disabled:opacity-50',
          )}
        />
        <Button
          type="button"
          size="icon"
          rounded="lg"
          onClick={send}
          // 버튼 탭 시 textarea 포커스가 빠져 키보드가 닫히는 것 방지
          onPointerDown={(e) => e.preventDefault()}
          disabled={!canSend}
          aria-label={editing ? '수정 완료' : '보내기'}
          className="shrink-0"
        >
          {editing ? <Check className="size-[18px]" /> : <SendHorizontal className="size-[18px]" />}
        </Button>
      </div>
      {text.length > MAX_LENGTH - 200 && (
        <p className="mt-1 text-right text-[11px] text-gray-400 tabular-nums">
          {text.length}/{MAX_LENGTH}
        </p>
      )}
    </div>
  );
};
