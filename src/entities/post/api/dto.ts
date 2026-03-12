export interface PostResponseDTO {
  items: PostDTO[];
  total: number;
  page: number;
  page_size: number;
  total_pages: number;
  previous: number;
  next: number;
}

export interface PostDTO {
  id: number;
  category: string;
  title: string;
  content: string;
  author_id: number;
  author_name: string;
  author_position: string;
  created_at: string;
  updated_at: string;
  comments_count: number;
}

export interface Comment {
  id: number;
  post_id: number;
  author_id: number;
  author_name: string;
  author_position: string;
  content: string;
  created_at: string;
  updated_at: string;
}
