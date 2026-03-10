import type { BoardDetailItem } from './boardType';
import type { CommunityPostDTO } from '../api/dto';

export interface BoardItem {
  id: number;
  title: string;
  content: string;
  author: string;
  createdAt: string;
}

export function mapCommunityPostToBoardItem(dto: CommunityPostDTO): BoardItem {
  return {
    id: dto.id,
    title: dto.title,
    content: dto.content,
    author: dto.author_name,
    createdAt: dto.created_at,
  };
}

export function mapBoardDetail(dto: CommunityPostDTO): BoardDetailItem {
  return {
    id: dto.id,
    title: dto.title,
    content: dto.content,
    authorId: dto.author_id,
    authorName: dto.author_name,
    createdAt: dto.created_at,
    updatedAt: dto.updated_at,
    category: dto.category === '공지' ? '공지' : '자유게시판',
  };
}
