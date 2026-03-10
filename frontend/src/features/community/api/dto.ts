// notice DTO
export interface CreatePostRequestDTO {
  title: string;
  content: string;
  category: '공지' | '자유게시판' | '근무교대' | '휴무신청';
}

export interface CreatePostResponseDTO {
  id: number;
  title: string;
  content: string;
  category: string;
  created_at: string;
}

// 댓글 DTO
export interface CommentDTO {
  id: number;
  post_id: number;
  author_id: number;
  author_name: string;
  author_position: string;
  content: string;
  created_at: string;
  updated_at: string;
}

// 게시글 DTO
export interface CommunityPostDTO {
  id: number;
  category: '공지' | '자유게시판' | '근무교대' | '휴무신청';
  title: string;
  content: string;
  author_id: number;
  author_name: string;
  author_position: string;
  system_generated: boolean;
  created_at: string;
  updated_at: string;
  comments: CommentDTO[];
}

// 게시글 DTO (2)
export interface CommunityPostListResponseDTO {
  items: CommunityPostDTO[];
  total: number;
  page: number;
  page_size: number;
  total_pages: number;
  previous: number | null;
  next: number | null;
}

// 댓글 조회 DTO
export interface CommentsResponseDTO {
  items: CommentDTO[];
  total: number;
  page: number;
  page_size: number;
  total_pages: number;
  previous: number | null;
  next: number | null;
}

// 댓글 생성 DTO
export interface CreateCommentRequestDTO {
  content: string;
}

// 커뮤 GET params
export interface GetCommunityPostsParams {
  category?: string;
  page?: number;
  page_size?: number;
  search?: string;
  order?: 'latest' | 'oldest' | 'popular';
}

// 카테고리별 글 갯수
export interface CategoryCountsResponse {
  counts: Record<string, number>;
}
