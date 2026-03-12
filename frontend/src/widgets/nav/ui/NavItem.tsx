import type { ComponentType } from 'react';

import { cn } from '@/shared/lib/utils';

interface NavItemProps {
  icon: ComponentType<{ className?: string }>;
  label: string;
  active?: boolean;
  onClick?: () => void;
  collapsed?: boolean;
}

const NavItem = ({ icon: Icon, label, active, onClick, collapsed }: NavItemProps) => {
  return (
    <button
      onClick={onClick}
      title={collapsed ? label : undefined}
      className={cn(
        'group relative w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150',
        active
          ? 'bg-white/15 text-white shadow-sm'
          : 'text-white/60 hover:text-white hover:bg-white/8',
        collapsed && 'justify-center px-2',
      )}
    >
      <Icon className={cn('shrink-0', collapsed ? 'size-5' : 'size-[18px]')} />
      {!collapsed && <span className="truncate">{label}</span>}
      {active && !collapsed && <span className="ml-auto size-1.5 rounded-full bg-white/60" />}
    </button>
  );
};

export default NavItem;
