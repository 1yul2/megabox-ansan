import { useLogoutMutation } from '../api/queries';

import type { VariantProps } from 'class-variance-authority';

import { Button, buttonVariants } from '@/shared/components/ui/button';

const LogoutBtn = ({
  children,
  className,
  variant,
}: {
  children: React.ReactNode;
  className?: string;
  variant?: VariantProps<typeof buttonVariants>['variant'];
}) => {
  const { mutate: logout } = useLogoutMutation();

  const handleLogout = () => {
    logout();
  };

  return (
    <Button variant={variant} className={className} onClick={handleLogout}>
      {children}
    </Button>
  );
};

export default LogoutBtn;
