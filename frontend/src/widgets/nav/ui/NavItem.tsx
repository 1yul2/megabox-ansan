import type { ComponentType } from 'react';

import { Button } from '@/shared/components/ui/button';

interface NavItemProps {
  icon: ComponentType<{ className?: string }>;
  active?: boolean;
  onClick?: () => void;
}

const NavItem = ({ icon: Icon, active, onClick }: NavItemProps) => {
  return (
    <Button
      variant={active ? 'default' : 'nav'}
      size="icon-lg"
      rounded="lg"
      onClick={onClick}
      className="shadow-sm"
    >
      <Icon className="size-5" />
    </Button>
  );
};
export default NavItem;
