import { Check, Search, X } from 'lucide-react';
import { useMemo, useState } from 'react';

import { useChatUsersQuery } from '../api/queries';

import { ChatAvatar } from './ChatAvatar';

import type { ChatUserDTO } from '../api/dto';

import { cn } from '@/shared/lib/utils';

type UserPickerProps = {
  selected: ChatUserDTO[];
  onChange: (users: ChatUserDTO[]) => void;
  /** 이미 참여 중이라 선택할 수 없는 사용자 */
  excludeIds?: number[];
};

/** 직원 다중 선택 — 상단 선택 칩 + 검색 + 체크 목록 */
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
        <div className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-1 scrollbar-hide">
          {selected.map((u) => (
            <button
              key={u.id}
              type="button"
              onClick={() => toggle(u)}
              className="group flex w-14 shrink-0 flex-col items-center gap-1 animate-in fade-in zoom-in-90 duration-150"
              aria-label={`${u.name} 선택 해제`}
            >
              <span className="relative">
                <ChatAvatar user={u} className="size-11" />
                <span className="absolute -top-0.5 -right-0.5 flex size-4 items-center justify-center rounded-full bg-gray-700 text-white ring-2 ring-white">
                  <X className="size-2.5" />
                </span>
              </span>
              <span className="w-full truncate text-center text-[11px] text-gray-600">
                {u.name}
              </span>
            </button>
          ))}
        </div>
      )}

      <label className="flex h-11 items-center gap-2 rounded-xl bg-gray-50 px-3 ring-1 ring-black/[0.05] focus-within:ring-2 focus-within:ring-mega-secondary/30">
        <Search className="size-4 text-gray-400" />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="이름으로 검색"
          className="min-w-0 flex-1 bg-transparent text-[15px] outline-none placeholder:text-gray-400"
        />
      </label>

      <ul className="-mx-2 max-h-[min(44dvh,360px)] min-h-[160px] overflow-y-auto overscroll-contain">
        {isLoading ? (
          <li className="py-10 text-center text-sm text-gray-400">불러오는 중…</li>
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
                  className="flex w-full items-center gap-3 rounded-xl px-2 py-2 text-left transition-colors hover:bg-gray-50 active:bg-gray-100"
                >
                  <ChatAvatar user={u} className="size-10" />
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-[15px] font-medium text-gray-900">
                      {u.name}
                    </span>
                    <span className="text-xs text-gray-400">{u.position}</span>
                  </span>
                  <span
                    className={cn(
                      'flex size-6 items-center justify-center rounded-full border-2 transition-all',
                      checked
                        ? 'scale-100 border-transparent bg-mega-secondary text-white'
                        : 'border-gray-200 text-transparent',
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
