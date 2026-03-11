import { memo, useState } from 'react';
import { Send } from 'lucide-react';
import { cn } from '@/shared/lib/utils';

interface CommentFormProps {
  onSubmit: (content: string) => void;
  isLoading?: boolean;
}

const CommentForm = memo(({ onSubmit, isLoading }: CommentFormProps) => {
  const [content, setContent] = useState('');
  const isEmpty = !content.trim();

  const handleSubmit = () => {
    if (isEmpty || isLoading) return;
    onSubmit(content.trim());
    setContent('');
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.nativeEvent.isComposing) return;
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <div className="flex gap-3 items-end">
      <div className="flex-1 relative">
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="댓글을 입력하세요  (Enter: 등록, Shift+Enter: 줄바꿈)"
          rows={2}
          className={cn(
            'w-full resize-none rounded-2xl border px-4 py-3 text-sm leading-relaxed',
            'placeholder:text-gray-400 bg-gray-50 transition-all',
            'focus:outline-none focus:ring-2 focus:ring-[#5b31a5]/20 focus:border-[#5b31a5]/40 focus:bg-white',
            'border-gray-200',
          )}
        />
      </div>
      <button
        type="button"
        onClick={handleSubmit}
        disabled={isEmpty || isLoading}
        className={cn(
          'flex items-center justify-center w-10 h-10 rounded-2xl transition-all duration-150 shrink-0 mb-0.5',
          'disabled:opacity-40 disabled:cursor-not-allowed',
          isEmpty || isLoading
            ? 'bg-gray-100 text-gray-400'
            : 'bg-[#351f66] text-white hover:bg-[#1a0f3c] shadow-sm active:scale-95',
        )}
      >
        {isLoading
          ? <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
          : <Send className="size-4" />
        }
      </button>
    </div>
  );
});

CommentForm.displayName = 'CommentForm';
export default CommentForm;
