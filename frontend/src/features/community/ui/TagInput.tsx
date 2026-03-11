import { useState, type KeyboardEvent } from 'react';
import { Input } from '@/shared/components/ui/input';
import { TagChip } from './TagChip';

interface TagInputProps {
  tags: string[];
  onChange: (tags: string[]) => void;
  maxTags?: number;
  placeholder?: string;
}

export function TagInput({ tags, onChange, maxTags = 5, placeholder = '태그 입력 후 Enter' }: TagInputProps) {
  const [input, setInput] = useState('');

  const addTag = (raw: string) => {
    const tag = raw.replace(/^#/, '').trim().toLowerCase();
    if (!tag || tags.includes(tag) || tags.length >= maxTags) return;
    onChange([...tags, tag]);
    setInput('');
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.nativeEvent.isComposing) return;
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      addTag(input);
    }
    if (e.key === 'Backspace' && !input && tags.length > 0) {
      onChange(tags.slice(0, -1));
    }
  };

  return (
    <div className="flex flex-col gap-2">
      <div className="flex flex-wrap gap-1.5 min-h-[28px]">
        {tags.map((tag) => (
          <TagChip
            key={tag}
            tag={tag}
            onRemove={() => onChange(tags.filter((t) => t !== tag))}
          />
        ))}
      </div>
      {tags.length < maxTags && (
        <Input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          onBlur={() => { if (input.trim()) addTag(input); }}
          placeholder={placeholder}
          className="h-9 text-sm"
        />
      )}
      <p className="text-[11px] text-gray-400">
        Enter 또는 쉼표로 추가 · 최대 {maxTags}개 · Backspace로 삭제
      </p>
    </div>
  );
}
