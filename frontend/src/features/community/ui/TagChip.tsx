import { memo } from 'react';
import { X } from 'lucide-react';
import { cn } from '@/shared/lib/utils';

interface TagChipProps {
  tag: string;
  onClick?: () => void;
  onRemove?: () => void;
  active?: boolean;
  size?: 'sm' | 'md';
}

export const TagChip = memo(({ tag, onClick, onRemove, active, size = 'sm' }: TagChipProps) => {
  return (
    <span
      onClick={onClick}
      className={cn(
        'inline-flex items-center gap-1 rounded-full border font-medium transition-all duration-150',
        size === 'sm' ? 'px-2 py-0.5 text-[11px]' : 'px-3 py-1 text-xs',
        onClick && 'cursor-pointer',
        active
          ? 'bg-[#351f66] text-white border-[#351f66]'
          : 'bg-gray-50 text-gray-600 border-gray-200 hover:bg-[#351f66]/8 hover:text-[#351f66] hover:border-[#351f66]/30',
      )}
    >
      <span className="text-[#5b31a5]">#</span>
      {tag}
      {onRemove && (
        <button
          type="button"
          onClick={(e) => { e.stopPropagation(); onRemove(); }}
          className="ml-0.5 rounded-full hover:bg-white/20 transition-colors"
        >
          <X className="size-2.5" />
        </button>
      )}
    </span>
  );
});

TagChip.displayName = 'TagChip';
