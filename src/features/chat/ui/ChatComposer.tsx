import { ArrowUp } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

import { cn } from '@/shared/lib/utils';

type ChatComposerProps = {
  onSend: (text: string) => void;
  onTyping?: () => void;
  disabled?: boolean;
  /** 방이 바뀌면 입력창 초기화 + 포커스 */
  resetKey?: number;
};

const MAX_LENGTH = 2000;
const TYPING_THROTTLE = 2500;

/** 터치 기기에서는 Enter = 줄바꿈 (전송은 버튼), 키보드 기기에서는 Enter = 전송 / Shift+Enter = 줄바꿈 */
const isCoarsePointer = () =>
  typeof window !== 'undefined' && window.matchMedia('(pointer: coarse)').matches;

export const ChatComposer = ({ onSend, onTyping, disabled, resetKey }: ChatComposerProps) => {
  const [text, setText] = useState('');
  const ref = useRef<HTMLTextAreaElement>(null);
  const lastTyping = useRef(0);

  useEffect(() => {
    setText('');
    if (!isCoarsePointer()) ref.current?.focus();
  }, [resetKey]);

  // 내용에 맞춰 높이 자동 조절 (최대 약 5줄)
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = `${Math.min(el.scrollHeight, 132)}px`;
  }, [text]);

  const canSend = text.trim().length > 0 && !disabled;

  const send = () => {
    if (!canSend) return;
    onSend(text.trim());
    setText('');
    // 모바일에서 전송 후 키보드가 내려가지 않도록 포커스 유지
    ref.current?.focus();
  };

  const handleChange = (value: string) => {
    setText(value.slice(0, MAX_LENGTH));
    const now = Date.now();
    if (value && now - lastTyping.current > TYPING_THROTTLE) {
      lastTyping.current = now;
      onTyping?.();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    // 한글 IME 조합 중 Enter 는 글자 확정이므로 무시
    if (e.nativeEvent.isComposing || e.keyCode === 229) return;
    if (e.key === 'Enter' && !e.shiftKey && !isCoarsePointer()) {
      e.preventDefault();
      send();
    }
  };

  return (
    <div className="px-3 pt-2 pb-[max(0.75rem,env(safe-area-inset-bottom))] sm:px-5 sm:pb-4">
      <div
        className={cn(
          'flex items-end gap-2 rounded-[26px] bg-white/90 p-1.5 pl-4 backdrop-blur-xl',
          'shadow-[0_8px_30px_-12px_rgba(23,43,77,0.25)] ring-1 ring-black/[0.06]',
          'transition focus-within:ring-2 focus-within:ring-mega-secondary/30',
        )}
      >
        <textarea
          ref={ref}
          rows={1}
          value={text}
          disabled={disabled}
          onChange={(e) => handleChange(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="메시지 보내기"
          enterKeyHint="send"
          aria-label="메시지 입력"
          className="max-h-[132px] min-h-[40px] flex-1 resize-none bg-transparent py-2 text-[16px] leading-6 outline-none placeholder:text-gray-400 disabled:opacity-50"
        />
        <button
          type="button"
          onClick={send}
          // 버튼 탭 시 textarea 포커스가 빠져 키보드가 닫히는 것 방지
          onPointerDown={(e) => e.preventDefault()}
          disabled={!canSend}
          aria-label="보내기"
          className={cn(
            'flex size-10 shrink-0 items-center justify-center rounded-full text-white transition-all duration-200',
            canSend
              ? 'scale-100 bg-linear-to-br from-mega-secondary to-mega shadow-[0_6px_16px_-6px_rgba(23,43,77,0.6)] active:scale-90'
              : 'scale-90 bg-gray-200',
          )}
        >
          <ArrowUp className="size-5" strokeWidth={2.5} />
        </button>
      </div>
      {text.length > MAX_LENGTH - 200 && (
        <p className="mt-1 pr-3 text-right text-[11px] text-gray-400 tabular-nums">
          {text.length}/{MAX_LENGTH}
        </p>
      )}
    </div>
  );
};
