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

  const handleLogout = () => {
    logout();
    setIsLogoutDialogOpen(false);
  };

  const avatarFallback = user?.name ? user.name.charAt(0) : '?';

  return (
    <>
      <div className="fixed top-0 left-0 w-full h-14 bg-white flex justify-between items-center px-5 z-50 shadow-sm">
        {/* 왼쪽: 햄버거 메뉴 + 로고 */}
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden text-mega-secondary hover:bg-mega-secondary/10 hover:text-mega-secondary rounded-lg"
            onClick={onMenuClick}
            aria-label="메뉴 열기"
          >
            <Menu className="size-5" />
          </Button>
          <Link to={ROUTES.ROOT}>
            <img
              src={logo}
              alt="MegaHub 로고"
              className="h-6 transition-all duration-200 cursor-pointer"
            />
          </Link>
        </div>

        {/* 오른쪽: 유저 정보 + Separator + 아이콘 액션 */}
        <div className="flex items-center gap-2">
          {/* 유저 정보: Avatar + 이름 + 날짜 (sm 이상에서만 표시) */}
          <div className="hidden sm:flex items-center gap-2">
            <Avatar className="size-7">
              <AvatarFallback className="bg-mega-secondary/20 text-mega-secondary text-xs font-semibold">
                {avatarFallback}
              </AvatarFallback>
            </Avatar>
            <span className="text-mega-blue text-sm font-medium">{user?.name}</span>
            <Separator orientation="vertical" className="h-4 mx-1" />
            <span className="text-muted-foreground text-xs font-light">{today}</span>
          </div>

          {/* 구분선: 정보 영역과 액션 아이콘 사이 (sm 이상) */}
          <Separator orientation="vertical" className="hidden sm:block h-4 mx-1" />

          {/* 알림 아이콘 */}
          <Button
            variant="ghost"
            size="icon"
            className="size-8 rounded-lg hover:bg-gray-100 hover:text-gray-700 transition-colors"
            aria-label="알림"
          >
            <Bell size={18} strokeWidth={2.5} />
          </Button>

          {/* 로그아웃 아이콘 버튼 */}
          <Button
            variant="ghost"
            size="icon"
            className="size-8 rounded-lg hover:bg-gray-100 hover:text-gray-700 transition-colors"
            aria-label="로그아웃"
            onClick={() => setIsLogoutDialogOpen(true)}
          >
            <LogOut size={18} strokeWidth={2.5} />
          </Button>
        </div>
      </div>

      {/* 로그아웃 확인 다이얼로그 */}
      <Dialog open={isLogoutDialogOpen} onOpenChange={setIsLogoutDialogOpen}>
        <DialogContent showCloseButton={false} className="max-w-sm">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <LogOut size={18} className="text-destructive" strokeWidth={2.5} />
              로그아웃
            </DialogTitle>
            <DialogDescription>로그아웃 하시겠습니까? 현재 세션이 종료됩니다.</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsLogoutDialogOpen(false)}>
              취소
            </Button>
            <Button variant="destructive" onClick={handleLogout}>
              로그아웃
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};
