import {
  Menu,
  Component,
  DollarSign,
  CalendarCheck2,
  ArrowLeftRight,
  CloudOff,
  MessageSquare,
} from 'lucide-react';
import { Link } from 'react-router';

import { ROUTES } from '../../shared/constants/routes';

export const Sidebar = () => {
  const iconHover = 'transition-all duration-200 hover:bg-mega-blue cursor-pointer';

  return (
    <div className="fixed top-14 left-0 bottom-0 w-18 bg-mega-gray flex flex-col items-center z-40">
      <div className="flex items-center justify-center h-20 w-full">
        <Menu size={30} strokeWidth={3} color="white" />
      </div>
      <Link to={ROUTES.ROOT} className="w-full">
        <div className={`${iconHover} flex flex-col items-center justify-center gap-2 h-20 w-full`}>
          <Component size={26} strokeWidth={2} color="white" />
          <div className="text-white text-xs">메인메뉴</div>
        </div>
      </Link>

      <Link to={ROUTES.PAY} className="w-full">
        <div className={`${iconHover} flex flex-col items-center justify-center gap-2 h-20 w-full`}>
          <DollarSign size={26} strokeWidth={2} color="white" />
          <div className="text-white text-xs">급여</div>
        </div>
      </Link>

      {/* 스케쥴 페이지 구현 완료 시 router 연결 */}
      {/* <Link to={ROUTES.} className="w-full"> */}
      <div className={`${iconHover} flex flex-col items-center justify-center gap-2 h-20 w-full`}>
        <CalendarCheck2 size={26} strokeWidth={2} color="white" />
        <div className="text-white text-xs">스케쥴</div>
      </div>
      {/* </Link> */}

      {/* 근무교대 페이지 구현 완료 시 router 연결 */}
      {/* <Link to={ROUTES.} className="w-full"> */}
      <div className={`${iconHover} flex flex-col items-center justify-center gap-2 h-20 w-full`}>
        <ArrowLeftRight size={26} strokeWidth={2} color="white" />
        <div className="text-white text-xs">근무교대</div>
      </div>
      {/* </Link> */}

      {/* 휴무신청 페이지 구현 완료 시 router 연결 */}
      {/* <Link to={ROUTES.} className="w-full"> */}
      <div className={`${iconHover} flex flex-col items-center justify-center gap-2 h-20 w-full`}>
        <CloudOff size={26} strokeWidth={2} color="white" />
        <div className="text-white text-xs">휴무신청</div>
      </div>
      {/* </Link> */}

      <Link to={ROUTES.COMMUNITY} className="w-full">
        <div className={`${iconHover} flex flex-col items-center justify-center gap-2 h-20 w-full`}>
          <MessageSquare size={26} strokeWidth={2} color="white" />
          <div className="text-white text-xs">커뮤니티</div>
        </div>
      </Link>
    </div>
  );
};
