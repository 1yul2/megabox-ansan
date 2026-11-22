import { LayoutGrid } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router';

import { NAV_ITEMS, type NavItemConfig } from '../model/nav.config';

import { useUserQuery } from '@/entities/user/api/queries';
import { useChatUnreadQuery } from '@/features/chat';
import { useUnreadCountQuery } from '@/features/message';
import { cn } from '@/shared/lib/utils';

/** 하단 탭에 노출할 메뉴 (나머지는 '전체' 드로어에서 접근) */
const TAB_KEYS = ['dashboard', 'schedule', 'pay', 'chat', 'community'] as const;

interface MobileTabBarProps {
  onMenuClick: () => void;
  menuOpen?: boolean;
}

/** 모바일 하단 탭바 (lg 미만) */
const MobileTabBar = ({ onMenuClick, menuOpen = false }: MobileTabBarProps) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { data: user } = useUserQuery();
  const { data: messageUnread } = useUnreadCountQuery();
  const { data: chatUnread } = useChatUnreadQuery();
  const chatUnreadCount = chatUnread?.count ?? 0;

  const tabs = TAB_KEYS.map((key) => NAV_ITEMS.find((item) => item.key === key)).filter(
    (item): item is NavItemConfig =>
      !!item && (!item.requiredRoles || (!!user && item.requiredRoles.includes(user.position))),
  );

  const isActive = (item: NavItemConfig) =>
    item.exact ? location.pathname === item.path : location.pathname.startsWith(item.path);

  const anyTabActive = tabs.some(isActive);
  const hasUnread = (messageUnread?.count ?? 0) > 0;

  const itemClass = (active: boolean) =>
    cn(
      'relative flex min-w-0 flex-1 flex-col items-center justify-center gap-1 pt-2 pb-1.5 text-[11px] font-semibold transition-colors',
      'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring/40',
      active ? 'text-mega' : 'text-gray-500 active:text-gray-700',
    );

  return (
    <nav
      data-mobile-tabbar
      aria-label="주요 메뉴"
      className="lg:hidden fixed inset-x-0 bottom-0 z-30 border-t border-gray-200 bg-white/95 backdrop-blur-md pb-safe"
    >
      <div className="mx-auto flex h-tabbar max-w-xl items-stretch">
        {tabs.map((item) => {
          const Icon = item.icon;
          const active = isActive(item);
          return (
            <button
              key={item.key}
              type="button"
              onClick={() => void navigate(item.path)}
              aria-current={active ? 'page' : undefined}
              className={itemClass(active)}
            >
              {active && (
                <span className="absolute top-0 left-1/2 h-0.5 w-8 -translate-x-1/2 rounded-b-full bg-mega" />
              )}
              <span className="relative">
                <Icon className="size-[22px]" strokeWidth={active ? 2.25 : 1.9} />
                {item.key === 'chat' && chatUnreadCount > 0 && (
                  <span className="absolute -top-1.5 left-3 min-w-4 h-4 rounded-full bg-red-500 px-1 text-center text-[9px] font-bold leading-4 text-white ring-2 ring-white tabular-nums">
                    {chatUnreadCount > 99 ? '99+' : chatUnreadCount}
                  </span>
                )}
              </span>
              <span className="truncate">{item.label}</span>
            </button>
          );
        })}

        <button
          type="button"
          onClick={onMenuClick}
          aria-label={hasUnread ? '전체 메뉴 (읽지 않은 메시지 있음)' : '전체 메뉴'}
          aria-expanded={menuOpen}
          className={itemClass(menuOpen || !anyTabActive)}
        >
          <span className="relative">
            <LayoutGrid className="size-[22px]" strokeWidth={1.9} />
            {hasUnread && (
              <span className="absolute -top-0.5 -right-1 size-2 rounded-full bg-red-500 ring-2 ring-white" />
            )}
          </span>
          <span>전체</span>
        </button>
      </div>
    </nav>
  );
};

export default MobileTabBar;
