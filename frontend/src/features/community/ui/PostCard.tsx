import { memo } from 'react';
import { Heart, MessageSquare } from 'lucide-react';
import { cn } from '@/shared/lib/utils';
import { formatRelativeTime } from '../model/formatData';
import { TagChip } from './TagChip';
import type { CommunityPostDTO } from '../api/dto';

// ── 카테고리 설정 ──────────────────────────────────────────────────────────
const CATEGORY_CONFIG: Record<string, { label: string; dot: string; badge: string }> = {
  '공지':      { label: '공지',     dot: 'bg-red-500',    badge: 'bg-red-50 text-red-700 border-red-200'      },
  '근무교대':  { label: '근무교대', dot: 'bg-green-500',  badge: 'bg-green-50 text-green-700 border-green-200' },
  '휴무신청':  { label: '휴무신청', dot: 'bg-sky-500',    badge: 'bg-sky-50 text-sky-700 border-sky-200'       },
  '자유게시판':{ label: '자유',     dot: 'bg-purple-500', badge: 'bg-purple-50 text-purple-700 border-purple-200' },
};

const DEFAULT_CONFIG = { label: '기타', dot: 'bg-gray-400', badge: 'bg-gray-50 text-gray-600 border-gray-200' };

interface PostCardProps {
  post: CommunityPostDTO;
  onClick: () => void;
  onTagClick?: (tag: string) => void;
  activeTag?: string;
}

export const PostCard = memo(({ post, onClick, onTagClick, activeTag }: PostCardProps) => {
  const config = CATEGORY_CONFIG[post.category] ?? DEFAULT_CONFIG;
  const tags = post.tags ?? [];
  const likes = post.likes_count ?? 0;
  const comments = post.comments_count ?? post.comments?.length ?? 0;

  return (
    <article
      onClick={onClick}
      className={cn(
        'group relative bg-white rounded-2xl border border-gray-100 shadow-sm',
        'cursor-pointer transition-all duration-200',
        'hover:shadow-md hover:border-gray-200 hover:-translate-y-[1px]',
        'overflow-hidden',
      )}
    >
      {/* 카테고리 컬러 바 */}
      <div className={cn('absolute left-0 top-0 bottom-0 w-1 rounded-l-2xl', config.dot)} />

      <div className="pl-5 pr-5 py-4">
        {/* 상단: 카테고리 배지 + 작성 시간 */}
        <div className="flex items-center justify-between mb-2">
          <span
            className={cn(
              'inline-flex items-center px-2.5 py-0.5 rounded-md text-[11px] font-semibold border',
              config.badge,
            )}
          >
            {config.label}
          </span>
          <time className="text-[11px] text-gray-400">
            {formatRelativeTime(post.created_at)}
          </time>
        </div>

        {/* 제목 */}
        <h3 className="text-[15px] font-semibold text-gray-900 leading-snug mb-1.5 group-hover:text-[#351f66] transition-colors line-clamp-1">
          {post.title}
        </h3>

        {/* 내용 미리보기 */}
        <p className="text-sm text-gray-500 leading-relaxed line-clamp-2 mb-3">
          {post.content}
        </p>

        {/* 태그 */}
        {tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-3" onClick={(e) => e.stopPropagation()}>
            {tags.map((tag) => (
              <TagChip
                key={tag}
                tag={tag}
                active={activeTag === tag}
                onClick={() => onTagClick?.(tag)}
              />
            ))}
          </div>
        )}

        {/* 하단: 작성자 + 통계 */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {/* 아바타 */}
            <div className="flex items-center justify-center w-6 h-6 rounded-full bg-[#5b31a5]/10 shrink-0">
              <span className="text-[10px] font-bold text-[#5b31a5]">
                {post.author_name.charAt(0)}
              </span>
            </div>
            <span className="text-xs font-medium text-gray-700">{post.author_name}</span>
            {post.author_position && (
              <>
                <span className="text-gray-300 text-xs">·</span>
                <span className="text-[11px] text-gray-400">{post.author_position}</span>
              </>
            )}
          </div>

          {/* 좋아요 + 댓글 */}
          <div className="flex items-center gap-3">
            <span className="inline-flex items-center gap-1 text-xs text-gray-400">
              <Heart className="size-3.5" />
              {likes}
            </span>
            <span className="inline-flex items-center gap-1 text-xs text-gray-400">
              <MessageSquare className="size-3.5" />
              {comments}
            </span>
          </div>
        </div>
      </div>
    </article>
  );
});

PostCard.displayName = 'PostCard';
