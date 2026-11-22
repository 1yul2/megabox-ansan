import { MessagesSquare } from 'lucide-react';
import { useNavigate, useParams } from 'react-router';

import {
  ChatRoomList,
  ChatRoomView,
  useBodyScrollLock,
  useMediaQuery,
  useVisualViewport,
} from '@/features/chat';
import { ROUTES } from '@/shared/constants/routes';
import { cn } from '@/shared/lib/utils';

/**
 * 채팅 페이지
 * - 데스크탑(lg+): 좌측 방 목록 + 우측 대화 2단 레이아웃 (화면 높이 고정)
 * - 모바일: /chat = 방 목록, /chat/:roomId = 전체화면 대화 (헤더·탭바를 덮고 키보드 위에 입력창 고정)
 */
const ChatPage = () => {
  const navigate = useNavigate();
  const { roomId: roomParam } = useParams();
  const parsed = Number(roomParam);
  const roomId = Number.isInteger(parsed) && parsed > 0 ? parsed : null;

  const isDesktop = useMediaQuery('(min-width: 1024px)');
  const mobileRoomOpen = !isDesktop && roomId != null;
  const viewport = useVisualViewport(mobileRoomOpen);
  useBodyScrollLock(mobileRoomOpen);

  const openRoom = (id: number) => void navigate(`${ROUTES.CHAT}/${id}`);
  const back = () => void navigate(ROUTES.CHAT);

  return (
    <div
      className={cn(
        'lg:-mx-2 lg:flex lg:h-[calc(100dvh-8rem)] lg:min-h-[520px] lg:overflow-hidden',
        'lg:rounded-[28px] lg:bg-white/60 lg:ring-1 lg:ring-black/[0.05] lg:shadow-[0_20px_60px_-30px_rgba(23,43,77,0.35)] lg:backdrop-blur-xl',
      )}
    >
      {/* 방 목록 — 모바일에서는 방을 열면 숨김 */}
      <ChatRoomList
        activeRoomId={roomId}
        onSelect={openRoom}
        className={cn(
          'lg:w-[360px] lg:shrink-0 lg:border-r lg:border-black/[0.05] lg:bg-white/40',
          mobileRoomOpen && 'hidden',
        )}
      />

      {/* 대화 영역 */}
      {roomId != null ? (
        <div
          className={cn(
            isDesktop
              ? 'min-w-0 flex-1'
              : 'fixed inset-x-0 top-0 z-40 h-dvh animate-in fade-in slide-in-from-right-4 duration-200',
          )}
          style={
            !isDesktop && viewport
              ? { height: viewport.height, transform: `translateY(${viewport.top}px)` }
              : undefined
          }
        >
          <ChatRoomView key={roomId} roomId={roomId} onBack={back} showBack={!isDesktop} />
        </div>
      ) : (
        <div className="hidden min-w-0 flex-1 flex-col items-center justify-center gap-4 bg-[#f4f6fa]/70 text-center lg:flex">
          <span className="flex size-20 items-center justify-center rounded-[28px] bg-linear-to-br from-mega-secondary/15 to-mega/5 text-mega-secondary">
            <MessagesSquare className="size-9" strokeWidth={1.8} />
          </span>
          <div>
            <p className="text-lg font-bold text-gray-800">대화를 선택하세요</p>
            <p className="mt-1 text-sm text-gray-400">
              왼쪽 목록에서 채팅방을 고르거나 새 채팅을 시작해보세요.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChatPage;
