import { ROLE_STYLES, type UserRole } from '@/entities/user/model/role';

interface PositionBadgeProps {
  role: string | null;
}

export default function PositionBadge({ role }: PositionBadgeProps) {
  if (!role) return <span>-</span>;

  const style = ROLE_STYLES[role as UserRole] ?? 'bg-gray-100 text-gray-500';

  return <span className={`px-3 py-1 rounded-full text-[10px] font-bold ${style}`}>{role}</span>;
}
