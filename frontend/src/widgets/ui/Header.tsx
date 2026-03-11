import { Bell, LogOut, Menu } from 'lucide-react';
import { useMemo, useState } from 'react';
import { Link } from 'react-router';
import { useUserQuery } from '@/entities/user/api/queries';
import { useLogoutMutation } from '@/features/login/api/queries';
import logo from '@/shared/assets/logo/Megabox_Logo_Indigo.png';
import { Avatar, AvatarFallback } from '@/shared/components/ui/avatar';
import { Button } from '@/shared/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/shared/components/ui/dialog';
import { Separator } from '@/shared/components/ui/separator';
import { ROUTES } from '@/shared/constants/routes';

interface HeaderProps {
  onMenuClick?: () => void;
}

export const Header = ({ onMenuClick }: HeaderProps) => {
  const { data: user } = useUserQuery();
  const { mutate: logout } = useLogoutMutation();
  const [isLogoutDialogOpen, setIsLogoutDialogOpen] = useState(false);

  const today = useMemo(() => {
    return new Date().toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      weekday: 'short',
    });
  }, []);

  const avatarFallback = user?.name ? user.name.charAt(0) : '?';

  return (
    <>
      <div className="fixed top-0 left-0 w-full h-14 bg-white/95 backdrop-blur-sm flex justify-between items-center px-5 z-50 border-b border-gray-100">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden size-9 rounded-xl hover:bg-gray-100"
            onClick={onMenuClick}
          >
            <Menu className="size-5 text-gray-600" />
          </Button>
          <Link to={ROUTES.ROOT}>
            <img src={logo} alt="MegaHub" className="h-6" />
          </Link>
        </div>
        <div className="flex items-center gap-2">
          <div className="hidden sm:flex items-center gap-2">
            <Avatar className="size-7">
              <AvatarFallback className="bg-[#5b31a5]/15 text-[#5b31a5] text-xs font-semibold">
                {avatarFallback}
              </AvatarFallback>
            </Avatar>
            <span className="text-[#59bec9] text-sm font-medium">{user?.name}</span>
            <Separator orientation="vertical" className="h-4 mx-1" />
            <span className="text-muted-foreground text-xs">{today}</span>
          </div>
          <Separator orientation="vertical" className="hidden sm:block h-4 mx-1" />
          <Button variant="ghost" size="icon" className="size-8 rounded-xl hover:bg-gray-100">
            <Bell size={18} />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="size-8 rounded-xl hover:bg-gray-100"
            onClick={() => setIsLogoutDialogOpen(true)}
          >
            <LogOut size={18} />
          </Button>
        </div>
      </div>

      <Dialog open={isLogoutDialogOpen} onOpenChange={setIsLogoutDialogOpen}>
        <DialogContent showCloseButton={false} className="max-w-sm">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <LogOut size={18} className="text-destructive" />
              로그아웃
            </DialogTitle>
            <DialogDescription>로그아웃 하시겠습니까? 현재 세션이 종료됩니다.</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsLogoutDialogOpen(false)}>
              취소
            </Button>
            <Button
              variant="destructive"
              onClick={() => {
                logout();
                setIsLogoutDialogOpen(false);
              }}
            >
              로그아웃
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};
