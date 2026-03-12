import type { CategoryHolder } from './category';
import type { ReactNode } from 'react';

// BoardPage
interface BoardItem {
  id: number;
  title: string;
  author: string;
  createdAt: string;
}

export interface BoardPageProps {
  title: string;
  icon: string;
  list: BoardItem[];
  canWrite: boolean;
  onSubmit?: (data: { title: string; content: string }) => void;
  ModalComponent?: React.ComponentType<{
    onClose: () => void;
    onSubmit: (data: { title: string; content: string }) => void;
  }>;
}

export interface BaseRow {
  id: number | string;
}

export interface Column<T extends BaseRow> {
  header: string;
  key: keyof T;
  width?: string;
  render?: (item: T, index: number) => React.ReactNode;
}

export interface BoardProps<T extends BaseRow> {
  list: T[];
  tf?: string;
  canWrite?: boolean;
  category?: string;
  renderBadge?: (item: T) => ReactNode;
  ModalComponent?: React.ComponentType<any>;
  pagination?: {
    currentPage: number;
    totalPages: number;
    onChangePage: (page: number) => void;
  };
  title?: string | ((item: CategoryHolder) => string);
  icon?: ReactNode | ((item: CategoryHolder) => ReactNode);
}

// BoardDetail
export interface BoardDetailItem {
  id: number;
  title: string;
  content: string;

  authorId: number;
  authorName: string;

  createdAt: string;
  updatedAt: string;
  category: '공지' | '자유게시판';
}

export interface BoardDetailProps {
  title: string;
  icon: ReactNode;
  list: BoardDetailItem[];
  notFoundMessage?: string;
  children?: ReactNode;
}

export interface BoardPost extends BaseRow {
  id: number;
  title: string;
  content: string;
  author_name: string;
  created_at: string;
  comments_count?: number;
}
