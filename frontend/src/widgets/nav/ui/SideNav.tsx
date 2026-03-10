import { Menu, X } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router';

import { NAV_ITEMS, type NavItemConfig } from '../model/nav.config';

import NavItem from './NavItem';

import { useUserQuery } from '@/entities/user/api/queries';
import { Button } from '@/shared/components/ui/button';
import { cn } from '@/shared/lib/utils';

interface SideNavProps {
  isOpen?: boolean;
  onClose?: () => void;
}

const SideNav = ({ isOpen = false, onClose }: SideNavProps) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { data: user } = useUserQuery();

  const isActive = (item: NavItemConfig) => {
    if (item.exact) {
      return location.pathname === item.path;
    }
    return location.pathname.startsWith(item.path);
  };

  const filteredNavItems = NAV_ITEMS.filter((item) => {
    if (!item.requiredRoles) return true;
    if (!user) return false;
    return item.requiredRoles.includes(user.position);
  });

  const handleNavClick = (path: string) => {
    void navigate(path);
    onClose?.();
  };

  return (
    <>
      {/* 모바일/태블릿 딤드 backdrop */}
      {isOpen && <div className="fixed inset-0 bg-black/40 z-30 md:hidden" onClick={onClose} />}

      <nav
        className={cn(
          'fixed top-14 left-0 bottom-0 flex flex-col gap-3 p-2 z-40',
          'bg-background/80 border-r transition-transform duration-300',
          isOpen ? 'translate-x-0' : '-translate-x-full',
          'md:translate-x-0 md:bg-transparent md:border-r-0',
        )}
      >
        {/* 모바일: X 닫기 버튼 */}
        <Button
          variant="nav"
          size="icon-lg"
          rounded="lg"
          onClick={onClose}
          className="shadow-sm md:hidden"
        >
          <X className="size-5" />
        </Button>
        {/* 데스크탑: Menu 아이콘 */}
        <Button variant="nav" size="icon-lg" rounded="lg" className="shadow-sm hidden md:flex">
          <Menu className="size-5" />
        </Button>

        <div className="w-full h-1 bg-mega-gray-light rounded-md" />

        {filteredNavItems.map((item) => (
          <NavItem
            key={item.key}
            icon={item.icon}
            active={isActive(item)}
            onClick={() => handleNavClick(item.path)}
          />
        ))}
      </nav>
    </>
  );
};

export default SideNav;
