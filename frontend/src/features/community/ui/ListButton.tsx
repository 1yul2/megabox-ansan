import { Link, useLocation } from 'react-router';

import type { LucideIcon } from 'lucide-react';

interface ListButtonProps {
  label: string;
  to: string;
  count?: number;
  icon?: LucideIcon;
  color?: string;
  activeColor?: string;
}

export default function ListButton({
  label,
  to,
  count,
  icon: Icon,
  color = 'border border-gray-200 bg-white',
  activeColor,
}: ListButtonProps) {
  const location = useLocation();
  const isActive = location.pathname.includes(`/community/${to}`);

  return (
    <Link to={to} className="flex items-center cursor-pointer">
      <div
        className={`
          flex items-center gap-1.5 sm:gap-2 text-[10px] sm:text-xs px-2.5 sm:px-4 py-1.5 sm:py-2 rounded-md
          ${isActive ? `text-white ${activeColor}` : color}
        `}
      >
        {Icon && <Icon size={12} className={isActive ? 'text-white' : 'text-gray-600'} />}
        <span className="hidden sm:inline leading-none">{label}</span>
        {count !== undefined && (
          <span
            className={
              isActive
                ? 'ml-1 px-1.5 py-0.5 text-[10px] sm:text-[11px] text-center rounded-full bg-white/70 text-gray-700 leading-none'
                : 'ml-1 px-1.5 py-0.5 text-[10px] sm:text-[11px] text-center rounded-full bg-gray-200 text-gray-700 leading-none'
            }
          >
            {count}
          </span>
        )}
      </div>
    </Link>
  );
}
