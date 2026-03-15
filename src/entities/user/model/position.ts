/** 직급별 뱃지(pill) 스타일 - admin 테이블 / 스케줄 카드 공통 사용 */
export const POSITION_BADGE_STYLE: Record<string, string> = {
  바이저: 'bg-blue-100 text-blue-700 border-blue-200',
  리더: 'bg-green-100 text-green-700 border-green-200',
  크루: 'bg-mega-secondary/10 text-mega-secondary border-mega-secondary/20',
  점장: 'bg-orange/10 text-orange border-orange/20',
};

/** 직급별 카드 왼쪽 강조 보더 - 스케줄 카드 전용 */
export const POSITION_BORDER_STYLE: Record<string, string> = {
  바이저: 'border-l-blue-400',
  리더: 'border-l-green-400',
  크루: 'border-l-mega-secondary',
  점장: 'border-l-orange',
};

export function getPositionBadgeStyle(position: string): string {
  return POSITION_BADGE_STYLE[position] ?? 'bg-muted text-muted-foreground border-muted';
}

export function getPositionBorderStyle(position: string): string {
  return POSITION_BORDER_STYLE[position] ?? 'border-l-gray-400';
}
