import { useState } from 'react';

import { formatRelativeTime } from '../../model/formatData';

import type { CommentDTO } from '../../api/dto';

import { Input } from '@/shared/components/ui/input';

interface CommentItemProps {
  comment: CommentDTO;
  currentUserId: number;
  onUpdate: (id: number, content: string) => void;
  onDelete: (id: number) => void;
}

export default function CommentItem({
  comment,
  currentUserId,
  onUpdate,
  onDelete,
}: CommentItemProps) {
  const isMine = comment.author_id === currentUserId;

  const [isEditing, setIsEditing] = useState(false);
  const [value, setValue] = useState(comment.content);
  const formattedDate = formatRelativeTime(comment.created_at);

  const handleSave = () => {
    if (!value.trim()) return;
    onUpdate(comment.id, value);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setValue(comment.content);
    setIsEditing(false);
  };

  return (
    <li className="bg-gray-50 rounded-md p-3">
      <div className="flex justify-between">
        <div className="flex items-center gap-2">
          {/* 임의 유저 프로필 들어갈 자리 */}
          <div className="rounded-full bg-mega w-8 h-8" />
          <div>
            <div className="text-xs font-bold">{comment.author_name}</div>
            <div className="text-[10px] text-gray-500">
              {formattedDate}
              {comment.updated_at !== comment.created_at ? ' · 수정됨' : ''}
            </div>
          </div>
        </div>
        {isMine && (
          <div className="mt-2 flex gap-2 text-xs text-gray-400">
            {!isEditing ? (
              <div className="flex items-center gap-1">
                <button onClick={() => setIsEditing(true)}>수정</button>
                <div className="text-gray-300"> | </div>
                <button onClick={() => onDelete(comment.id)}>삭제</button>
              </div>
            ) : (
              <>
                <button onClick={handleSave} className="text-blue-600">
                  저장
                </button>
                <button onClick={handleCancel}>취소</button>
              </>
            )}
          </div>
        )}
      </div>

      {!isEditing ? (
        <p className="mt-2 text-xs text-gray-600 whitespace-pre-line pl-10">{comment.content}</p>
      ) : (
        <Input
          className="resize-none mt-2 w-full border rounded-md p-2 text-sm"
          value={value}
          onChange={(e) => setValue(e.target.value)}
        />
      )}
    </li>
  );
}
