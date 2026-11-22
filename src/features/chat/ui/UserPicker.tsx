import { Check, Search, X } from 'lucide-react';
import { useMemo, useState } from 'react';

import { useChatUsersQuery } from '../api/queries';

import { ChatAvatar } from './ChatAvatar';

import type { ChatUserDTO } from '../api/dto';

import { getPositionBadgeStyle } from '@/entities/user/model/position';
import { InputGroup, InputGroupAddon, InputGroupInput } from '@/shared/components/ui/input-group';
import { cn } from '@/shared/lib/utils';

type UserPickerProps = {
  selected: ChatUserDTO[];
  onChange: (users: ChatUserDTO[]) => void;
  /** 이미 참여 중이라 선택할 수 없는 사용자 */
  excludeIds?: number[];
};

/** 직원 다중 선택 — 선택 칩 + 검색 + 체크 목록 */
export const UserPicker = ({ selected, onChange, excludeIds = [] }: UserPickerProps) => {
  const [query, setQuery] = useState('');
  const { data: users = [], isLoading } = useChatUsersQuery('');

  const excluded = useMemo(() => new Set(excludeIds), [excludeIds]);
  const selectedIds = useMemo(() => new Set(selected.map((u) => u.id)), [selected]);

  const filtered = useMemo(() => {
    const q = query.trim();
    return users.filter((u) => !excluded.has(u.id) && (!q || u.name.includes(q)));
  }, [users, query, excluded]);

  const toggle = (user: ChatUserDTO) => {
    onChange(
      selectedIds.has(user.id) ? selected.filter((u) => u.id !== user.id) : [...selected, user],
    );
  };

  return (
    <div className="flex min-h-0 flex-col gap-3">
      {/* 선택된 사람 */}
      {selected.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {selected.map((u) => (
            <button
              key={u.id}
              type="button"
              onClick={() => toggle(u)}
              aria-label={`${u.name} 선택 해제`}
              className="inline-flex items-center gap-1 rounded-full border border-navy-200 bg-navy-50 py-0.5 pr-2 pl-0.5 text-xs font-medium text-navy-700 hover:bg-navy-100"
            >
              <ChatAvatar user={u} className="size-5 text-[10px]" />
              {u.name}
              <X className="size-3" />
            </button>
          ))}
        </div>
      )}

      <InputGroup className="bg-white">
        <InputGroupAddon>
          <Search className="size-4" />
        </InputGroupAddon>
        <InputGroupInput
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="이름으로 검색"
          className="px-3 py-1"
        />
      </InputGroup>

      <ul className="max-h-[min(42dvh,340px)] min-h-[160px] divide-y divide-gray-100 overflow-y-auto overscroll-contain rounded-xl border border-gray-200">
        {isLoading ? (
          <li className="py-10 text-center text-sm text-gray-400">불러오는 중...</li>
        ) : filtered.length === 0 ? (
          <li className="py-10 text-center text-sm text-gray-400">
            {query ? '검색 결과가 없습니다.' : '초대할 수 있는 직원이 없습니다.'}
          </li>
        ) : (
          filtered.map((u) => {
            const checked = selectedIds.has(u.id);
            return (
              <li key={u.id}>
                <button
                  type="button"
                  onClick={() => toggle(u)}
                  aria-pressed={checked}
                  className={cn(
                    'flex w-full items-center gap-3 px-3 py-2.5 text-left transition-colors',
                    checked ? 'bg-mega-soft' : 'hover:bg-gray-50',
                  )}
                >
                  <ChatAvatar user={u} className="size-9 border border-gray-200" />
                  <span className="flex min-w-0 flex-1 items-center gap-1.5">
                    <span className="truncate text-sm font-medium text-gray-800">{u.name}</span>
                    <span
                      className={cn(
                        'inline-flex shrink-0 items-center rounded border px-1.5 py-0.5 text-[10px] font-medium',
                        getPositionBadgeStyle(u.position),
                      )}
                    >
                      {u.position}
                    </span>
                  </span>
                  <span
                    className={cn(
                      'flex size-5 shrink-0 items-center justify-center rounded border transition-colors',
                      checked
                        ? 'border-mega bg-mega text-white'
                        : 'border-gray-300 bg-white text-transparent',
                    )}
                  >
                    <Check className="size-3.5" strokeWidth={3} />
                  </span>
                </button>
              </li>
            );
          })
        )}
      </ul>
    </div>
  );
};
