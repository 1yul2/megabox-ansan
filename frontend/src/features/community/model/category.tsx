import { Megaphone, CloudOff, CalendarSync, MessagesSquare } from 'lucide-react';

import type { ReactElement } from 'react';

export type CommunityCategory = '공지' | '자유게시판' | '근무교대' | '휴무신청';

export interface CategoryHolder {
  category: string;
}

export const CATEGORY_LABEL = {
  notice: '공지',
  shift: '근무교대',
  dayoff: '휴무신청',
  free: '자유게시판',
} as const;

export type CategoryKey = keyof typeof CATEGORY_LABEL;
export type CategoryLabel = (typeof CATEGORY_LABEL)[CategoryKey];

export interface CategoryCountsResponse {
  total: number;
  notice: number;
  shift: number;
  dayoff: number;
  free: number;
}

export function mapCategoryToVariant(category: CommunityCategory) {
  switch (category) {
    case '공지':
      return 'notice';
    case '자유게시판':
      return 'free';
    case '근무교대':
      return 'shift';
    case '휴무신청':
      return 'dayoff';
    default:
      return 'free';
  }
}

export function getTitleForCategory(category: string) {
  switch (category) {
    case '공지':
      return '공지사항';
    case '자유게시판':
      return '자유 게시판';
    case '근무교대':
      return '근무 교대';
    case '휴무신청':
      return '휴무 신청';
    default:
      return '';
  }
}

export function getIconForCategory(category: string): ReactElement | null {
  switch (category) {
    case '공지':
      return <Megaphone />;
    case '자유게시판':
      return <MessagesSquare />;
    case '근무교대':
      return <CalendarSync />;
    case '휴무신청':
      return <CloudOff />;
    default:
      return <MessagesSquare />;
  }
}
