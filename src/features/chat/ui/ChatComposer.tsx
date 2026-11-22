import { SendHorizontal } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

import { Button } from '@/shared/components/ui/button';
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
    el.style.height = `${Math.min(el.scrollHeight, 128)}px`;
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
    <div className="border-t border-gray-100 bg-white px-3 pt-2.5 pb-[max(0.625rem,env(safe-area-inset-bottom))] sm:px-4">
      <div className="flex items-end gap-2">
        <textarea
          ref={ref}
          rows={1}
          value={text}
          disabled={disabled}
          onChange={(e) => handleChange(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="메시지를 입력하세요"
          enterKeyHint="send"
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
          aria-label="보내기"
          className="shrink-0"
        >
          <SendHorizontal className="size-[18px]" />
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
