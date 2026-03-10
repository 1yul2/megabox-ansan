import { CalendarSync, CloudOff, Megaphone, MessagesSquare, TextAlignStart } from 'lucide-react';
import { useEffect } from 'react';
import { Outlet, useLocation } from 'react-router';

import logo from '../../../shared/assets/logo/Megabox_Logo_Indigo.png';

import { ListButton } from '@/features/community';
import { useCategoryCountsQuery } from '@/features/community/api/queries';

export default function Communiity() {
  const location = useLocation();
  const { data, isLoading, refetch } = useCategoryCountsQuery();

  // 커뮤니티 내 라우팅 이동 시 카테고리 카운트 최신화
  // (휴무신청 후 탭 뱃지가 즉시 반영되도록 보장)
  useEffect(() => {
    void refetch();
  }, [location.pathname, refetch]);

  if (isLoading) return null;

  const categoryCounts = data?.counts ?? {};

  return (
    <div className="flex flex-col gap-5 w-full sm:w-3/4 mx-auto mb-10 px-4 sm:px-0">
      <img src={logo} alt="logo" className="w-40 sm:w-50 self-center mb-4" />

      <div className="flex flex-col gap-5">
        <div className="flex flex-wrap self-start gap-2">
          <ListButton
            label="전체"
            to="community"
            count={categoryCounts['전체'] ?? 0}
            icon={TextAlignStart}
            activeColor="bg-mega opacity-90"
          />
          <ListButton
            label="공지사항"
            to="notice"
            count={categoryCounts['공지'] ?? 0}
            icon={Megaphone}
            activeColor="bg-red-500"
          />
          <ListButton
            label="근무교대"
            to="shift"
            count={categoryCounts['근무교대'] ?? 0}
            icon={CalendarSync}
            activeColor="bg-[#44BC62]"
          />
          <ListButton
            label="휴무신청"
            to="dayoff"
            count={categoryCounts['휴무신청'] ?? 0}
            icon={CloudOff}
            activeColor="bg-[#00C0E8]"
          />
          <ListButton
            label="자유게시판"
            to="freeboard"
            count={categoryCounts['자유게시판'] ?? 0}
            icon={MessagesSquare}
            activeColor="bg-mega opacity-90"
          />
        </div>

        <Outlet />
      </div>
    </div>
  );
}
