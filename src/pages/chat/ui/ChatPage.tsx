import { MessagesSquare, Plus } from 'lucide-react';
import { useState } from 'react';
import { useNavigate, useParams } from 'react-router';

import {
  ChatRoomList,
  ChatRoomView,
  CreateRoomDialog,
  useBodyScrollLock,
  useChatConnected,
  useMediaQuery,
  useVisualViewport,
} from '@/features/chat';
import { Button } from '@/shared/components/ui/button';
import { PageHeader } from '@/shared/components/ui/PageHeader';
import { ROUTES } from '@/shared/constants/routes';
import { cn } from '@/shared/lib/utils';

/**
 * 채팅 페이지
 * - 데스크탑(lg+): 좌측 방 목록 + 우측 대화 2단 카드 (화면 높이에 맞춤)
 * - 모바일: /chat = 방 목록, /chat/:roomId = 전체화면 대화 (헤더·탭바를 덮고 키보드 위에 입력창 고정)
 */
const ChatPage = () => {
  const navigate = useNavigate();
  const { roomId: roomParam } = useParams();
  const parsed = Number(roomParam);
  const roomId = Number.isInteger(parsed) && parsed > 0 ? parsed : null;
  const [createOpen, setCreateOpen] = useState(false);
  const connected = useChatConnected();

  const isDesktop = useMediaQuery('(min-width: 1024px)');
  const mobileRoomOpen = !isDesktop && roomId != null;
  const viewport = useVisualViewport(mobileRoomOpen);
  useBodyScrollLock(mobileRoomOpen);

  const openRoom = (id: number) => void navigate(`${ROUTES.CHAT}/${id}`);
  const back = () => void navigate(ROUTES.CHAT);

  return (
    <div className="flex flex-col gap-5">
      <PageHeader
        icon={<MessagesSquare className="size-5 text-mega" />}
        iconBg="bg-mega/10"
        title="채팅"
        description={
          <p className="mt-1 flex items-center gap-1.5 text-[13px] leading-snug text-gray-500 sm:text-sm">
            <span
              className={cn(
                'size-1.5 shrink-0 rounded-full',
                connected ? 'bg-emerald-500' : 'bg-gray-300',
              )}
            />
            {connected ? '실시간으로 대화를 주고받을 수 있습니다.' : '서버에 연결하는 중입니다…'}
          </p>
        }
      >
        <Button onClick={() => setCreateOpen(true)} className="w-full gap-1.5 rounded-xl sm:w-auto">
          <Plus className="size-4" />새 채팅
        </Button>
      </PageHeader>

      <div
        className={cn(
          'overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm',
          'lg:grid lg:h-[calc(100dvh-15rem)] lg:min-h-[480px] lg:grid-cols-[340px_1fr]',
        )}
      >
        {/* 방 목록 */}
        <ChatRoomList
          activeRoomId={roomId}
          onSelect={openRoom}
          className="lg:border-r lg:border-gray-100"
        />

        {/* 대화 영역 */}
        {roomId != null ? (
          <div
            className={cn(
              isDesktop
                ? 'min-h-0 min-w-0'
                : 'fixed inset-x-0 top-0 z-40 h-dvh bg-app-bg animate-in fade-in duration-150',
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
          <div className="hidden min-w-0 flex-col items-center justify-center gap-3 bg-app-bg/60 text-center lg:flex">
            <div className="flex size-14 items-center justify-center rounded-2xl bg-mega/10">
              <MessagesSquare className="size-7 text-mega" />
            </div>
            <div>
              <p className="text-base font-semibold text-gray-800">대화를 선택하세요</p>
              <p className="mt-1 text-sm text-gray-400">
                왼쪽 목록에서 채팅방을 고르거나 새 채팅을 시작해보세요.
              </p>
            </div>
          </div>
        )}
      </div>

      <CreateRoomDialog
        open={createOpen}
        onOpenChange={setCreateOpen}
        onCreated={(id) => {
          setCreateOpen(false);
          openRoom(id);
        }}
      />
    </div>
  );
};

export default ChatPage;
