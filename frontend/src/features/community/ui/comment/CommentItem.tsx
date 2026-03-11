import { memo, useState } from 'react';
import { MoreHorizontal, Pencil, Trash2 } from 'lucide-react';
import { formatRelativeTime } from '../../model/formatData';
import type { CommentDTO } from '../../api/dto';
import { cn } from '@/shared/lib/utils';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/shared/components/ui/dropdown-menu';
import { Button } from '@/shared/components/ui/button';

interface CommentItemProps {
  comment: CommentDTO;
  currentUserId: number;
  onUpdate: (id: number, content: string) => void;
  onDelete: (id: number) => void;
}

export const CommentItem = memo(({ comment, currentUserId, onUpdate, onDelete }: CommentItemProps) => {
  const isMine = comment.author_id === currentUserId;
  const [isEditing, setIsEditing] = useState(false);
  const [value, setValue] = useState(comment.content);
  const isEdited = comment.updated_at !== comment.created_at;

  const handleSave = () => {
    if (!value.trim()) return;
    onUpdate(comment.id, value.trim());
    setIsEditing(false);
  };

  const handleCancel = () => {
    setValue(comment.content);
    setIsEditing(false);
  };

  return (
    <div className="flex gap-3">
      {/* 아바타 */}
      <div className="flex items-center justify-center w-8 h-8 rounded-full bg-[#5b31a5]/10 shrink-0 mt-0.5">
        <span className="text-xs font-bold text-[#5b31a5]">
          {comment.author_name.charAt(0)}
        </span>
      </div>

      {/* 본문 */}
      <div className="flex-1 min-w-0">
        {/* 작성자 + 시간 */}
        <div className="flex items-center gap-2 mb-1">
          <span className="text-xs font-semibold text-gray-800">{comment.author_name}</span>
          {comment.author_position && (
            <span className="text-[10px] text-gray-400 bg-gray-50 px-1.5 py-0.5 rounded-md">
              {comment.author_position}
            </span>
          )}
          <span className="text-[11px] text-gray-400">{formatRelativeTime(comment.created_at)}</span>
          {isEdited && <span className="text-[10px] text-gray-300">(수정됨)</span>}
        </div>

        {/* 내용 or 수정 폼 */}
        {isEditing ? (
          <div className="flex flex-col gap-2">
            <textarea
              value={value}
              onChange={(e) => setValue(e.target.value)}
              rows={3}
              autoFocus
              className="w-full resize-none rounded-xl border border-[#5b31a5]/30 bg-[#5b31a5]/5 px-3 py-2 text-sm leading-relaxed focus:outline-none focus:ring-2 focus:ring-[#5b31a5]/20"
            />
            <div className="flex gap-2">
              <Button size="sm" onClick={handleSave} className="h-7 px-3 text-xs bg-[#351f66] hover:bg-[#1a0f3c] rounded-lg">
                저장
              </Button>
              <Button size="sm" variant="outline" onClick={handleCancel} className="h-7 px-3 text-xs rounded-lg">
                취소
              </Button>
            </div>
          </div>
        ) : (
          <p className={cn(
            'text-sm text-gray-700 leading-relaxed whitespace-pre-line',
            'break-words',
          )}>
            {comment.content}
          </p>
        )}
      </div>

      {/* 내 댓글 메뉴 */}
      {isMine && !isEditing && (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              type="button"
              className="self-start mt-0.5 p-1 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
            >
              <MoreHorizontal className="size-4" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="min-w-[100px]">
            <DropdownMenuItem onClick={() => setIsEditing(true)} className="gap-2 cursor-pointer">
              <Pencil className="size-3.5" />
              수정
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => onDelete(comment.id)}
              className="gap-2 cursor-pointer text-destructive focus:text-destructive"
            >
              <Trash2 className="size-3.5" />
              삭제
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )}
    </div>
  );
});

CommentItem.displayName = 'CommentItem';
export default CommentItem;
