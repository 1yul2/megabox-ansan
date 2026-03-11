import { apiClient } from '../../../shared/api/apiClients';

import type {
  CategoryCountsResponse,
  CommentDTO,
  CommentsResponseDTO,
  CommunityPostDTO,
  CommunityPostListResponseDTO,
  CreateCommentRequestDTO,
  CreatePostRequestDTO,
  CreatePostResponseDTO,
  GetCommunityPostsParams,
} from './dto';

// 🔖 게시글
// POST
export const createPost = (data: CreatePostRequestDTO) =>
  apiClient.post<CreatePostResponseDTO>({
    url: '/api/community/posts',
    data,
  });

// GET
export const getCommunityPosts = (params?: GetCommunityPostsParams) =>
  apiClient.get<CommunityPostListResponseDTO>({
    url: '/api/community/posts',
    params,
  });

// Detail GET
export const getCommunityPostById = (id: number) =>
  apiClient.get<CommunityPostDTO>({
    url: `/api/community/posts/${id}`,
  });

// PATCH
export const updatePost = (id: number, data: Partial<CreatePostRequestDTO>) =>
  apiClient.patch<CommunityPostDTO>({
    url: `/api/community/posts/${id}`,
    data,
  });

// DELETE
export const deletePost = (id: number) =>
  apiClient.delete<{ success: boolean }>({
    url: `/api/community/posts/${id}`,
  });

// 카테고리별 글 갯수 GET
export const getCategoryCounts = () =>
  apiClient.get<CategoryCountsResponse>({
    url: '/api/community/category-counts',
  });

// 🔖 댓글
// GET
export const getComments = (postId: number, page = 1, pageSize = 10) =>
  apiClient.get<CommentsResponseDTO>({
    url: `/api/community/posts/${postId}/comments`,
    params: { page, page_size: pageSize },
  });

// POST
export const createComment = (postId: number, data: CreateCommentRequestDTO) =>
  apiClient.post<CommentDTO>({
    url: `/api/community/posts/${postId}/comments`,
    data,
  });

// PATCH
export const updateComment = (comment_id: number, content: string) =>
  apiClient.patch<CommentDTO>({
    url: `/api/community/comments/${comment_id}`,
    data: { content },
  });

// DELETE
export const deleteComment = (comment_id: number) =>
  apiClient.delete<{ success: boolean }>({
    url: `/api/community/comments/${comment_id}`,
  });

// 🔖 좋아요 (백엔드 구현 필요: POST/DELETE /api/community/posts/{id}/like)
export const likePost = (id: number) =>
  apiClient.post<{ likes_count: number; liked_by_me: boolean }>({
    url: `/api/community/posts/${id}/like`,
  });

export const unlikePost = (id: number) =>
  apiClient.delete<{ likes_count: number; liked_by_me: boolean }>({
    url: `/api/community/posts/${id}/like`,
  });
