import { useQueryClient } from '@tanstack/react-query';
import {
  ArrowDown,
  Bell,
  BellOff,
  ChevronLeft,
  Menu,
  MessageCircleOff,
  MessagesSquare,
} from 'lucide-react';
import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';

import {
  useChatMessagesQuery,
  useChatNotificationMutation,
  useChatRoomQuery,
  useDeleteChatMessageMutation,
  useEditChatMessageMutation,
  useMarkChatReadMutation,
  useSendChatImageMutation,
  useSendChatMessageMutation,
} from '../api/queries';
import { flattenMessages, patchMessage } from '../model/cache';
import { chatSocket } from '../model/chatSocket';
import { buildRows, newClientId } from '../model/format';
import { useTypingNames } from '../model/typingStore';

import { RoomAvatar } from './ChatAvatar';
import { ChatComposer, type EditingMessage } from './ChatComposer';
import { DateDivider, MessageBubble, SystemMessage, TypingBubble } from './MessageBubble';
import { EditHistoryDialog, ImageViewerDialog, MessageActionsDialog } from './MessageDialogs';
import { RoomInfoSheet } from './RoomInfoSheet';

import type { ChatMessageDTO } from '../api/dto';

import { useUserQuery } from '@/entities/user/api/queries';
import { USER_ROLES } from '@/entities/user/model/role';
import { Button } from '@/shared/components/ui/button';
import ConfirmDialog from '@/shared/components/ui/confirm-dialog';
import { Spinner } from '@/shared/components/ui/spinner';
import { getUploadUrl } from '@/shared/lib/avatar';
import { cn } from '@/shared/lib/utils';

type ChatRoomViewProps = {
  roomId: number;
  onBack: () => void;
  /** 모바일 전체화면일 때 뒤로가기 버튼 표시 */
  showBack: boolean;
};

const BOTTOM_THRESHOLD = 120;

export const ChatRoomView = ({ roomId, onBack, showBack }: ChatRoomViewProps) => {
  const qc = useQueryClient();
  const { data: me } = useUserQuery();
  const myId = me?.id != null ? Number(me.id) : undefined;
  const isAdmin = me?.position === USER_ROLES.ADMIN;

  const { data: room, isError: roomError } = useChatRoomQuery(roomId);
  const messagesQuery = useChatMessagesQuery(roomId);
  const { fetchNextPage, hasNextPage, isFetchingNextPage, isLoading } = messagesQuery;
  const messages = useMemo(() => flattenMessages(messagesQuery.data), [messagesQuery.data]);
  const rows = useMemo(() => buildRows(messages, myId), [messages, myId]);
  const typingNames = useTypingNames(roomId);

  const sendMutation = useSendChatMessageMutation(roomId, me);
  const deleteMutation = useDeleteChatMessageMutation(roomId);
  const imageMutation = useSendChatImageMutation(roomId, me);
  const editMutation = useEditChatMessageMutation(roomId);
  const readMutation = useMarkChatReadMutation(roomId);
  const notifyMutation = useChatNotificationMutation(roomId);

  const [infoOpen, setInfoOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<ChatMessageDTO | null>(null);
  const [actionTarget, setActionTarget] = useState<ChatMessageDTO | null>(null);
  const [editing, setEditing] = useState<EditingMessage | null>(null);
  const [viewerSrc, setViewerSrc] = useState<string | null>(null);
  const [historyId, setHistoryId] = useState<number | null>(null);
  const [newCount, setNewCount] = useState(0);

  // ── 보고 있는 방 알림 (서버가 이 방 푸시를 보내지 않음) ─────────────────────
  useEffect(() => {
    chatSocket.setViewing(roomId);
    return () => chatSocket.setViewing(null);
  }, [roomId]);

  // ── 스크롤 ─────────────────────────────────────────────────────────────────
  const scrollRef = useRef<HTMLDivElement>(null);
  const atBottomRef = useRef(true);
  const initialScrollDone = useRef(false);
  const olderAnchor = useRef<number | null>(null);
  const prevLastKey = useRef<string | null>(null);

  useEffect(() => {
    initialScrollDone.current = false;
    prevLastKey.current = null;
    atBottomRef.current = true;
    setNewCount(0);
  }, [roomId]);

  const scrollToBottom = useCallback((smooth = false) => {
    const el = scrollRef.current;
    if (!el) return;
    el.scrollTo({ top: el.scrollHeight, behavior: smooth ? 'smooth' : 'auto' });
  }, []);

  const handleScroll = () => {
    const el = scrollRef.current;
    if (!el) return;
    const atBottom = el.scrollHeight - el.scrollTop - el.clientHeight < BOTTOM_THRESHOLD;
    atBottomRef.current = atBottom;
    if (atBottom && newCount) setNewCount(0);
  };

  useLayoutEffect(() => {
    const el = scrollRef.current;
    if (!el || messages.length === 0) return;

    // 이전 메시지 로드 후: 보던 위치 유지
    if (olderAnchor.current != null) {
      el.scrollTop = el.scrollHeight - olderAnchor.current;
      olderAnchor.current = null;
      return;
    }

    const last = messages[messages.length - 1];
    const lastKey = `${last.id}:${last.client_id ?? ''}`;
    const isNewTail = prevLastKey.current !== null && prevLastKey.current !== lastKey;
    prevLastKey.current = lastKey;

    if (!initialScrollDone.current) {
      el.scrollTop = el.scrollHeight;
      initialScrollDone.current = true;
      return;
    }
    if (!isNewTail) return;

    const mine = last.sender?.id === myId;
    if (mine || atBottomRef.current) {
      scrollToBottom(true);
    } else if (last.message_type === 'text') {
      setNewCount((c) => c + 1);
    }
  }, [messages, myId, scrollToBottom]);

  // 입력 중 표시가 나타날 때 바닥에 있으면 따라가기
  useEffect(() => {
    if (typingNames.length && atBottomRef.current) scrollToBottom(true);
  }, [typingNames.length, scrollToBottom]);

  // 키보드가 올라오는 등 영역 크기가 바뀌어도 바닥 고정 유지
  useEffect(() => {
    const el = scrollRef.current;
    if (!el || typeof ResizeObserver === 'undefined') return;
    const ro = new ResizeObserver(() => {
      if (atBottomRef.current) el.scrollTop = el.scrollHeight;
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  // 위로 스크롤하면 이전 메시지 로드
  const topSentinel = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const target = topSentinel.current;
    const root = scrollRef.current;
    if (!target || !root || !hasNextPage) return;
    const io = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting && !isFetchingNextPage && initialScrollDone.current) {
          olderAnchor.current = root.scrollHeight - root.scrollTop;
          void fetchNextPage();
        }
      },
      { root, rootMargin: '200px 0px 0px 0px' },
    );
    io.observe(target);
    return () => io.disconnect();
  }, [hasNextPage, isFetchingNextPage, fetchNextPage, rows.length]);

  // ── 읽음 처리 ──────────────────────────────────────────────────────────────
  const lastReadSent = useRef(0);
  const latestServerId = useMemo(() => {
    for (let i = messages.length - 1; i >= 0; i -= 1) if (messages[i].id > 0) return messages[i].id;
    return 0;
  }, [messages]);

  useEffect(() => {
    lastReadSent.current = 0;
  }, [roomId]);

  useEffect(() => {
    if (!latestServerId || latestServerId <= lastReadSent.current) return;
    const flush = () => {
      if (document.visibilityState !== 'visible' || latestServerId <= lastReadSent.current) return;
      lastReadSent.current = latestServerId;
      readMutation.mutate(latestServerId);
    };
    const t = setTimeout(flush, 300);
    document.addEventListener('visibilitychange', flush);
    return () => {
      clearTimeout(t);
      document.removeEventListener('visibilitychange', flush);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [latestServerId, roomId]);

  // ── 안 읽은 사람 수 (메시지별) ───────────────────────────────────────────────
  const unreadFor = useMemo(() => {
    const members = room?.members ?? [];
    return (m: ChatMessageDTO) => {
      if (m.id < 0 || m.message_type === 'system') return 0;
      let n = 0;
      for (const mem of members) {
        if (mem.id !== m.sender?.id && mem.last_read_message_id < m.id) n += 1;
      }
      return n;
    };
  }, [room?.members]);

  // ── 전송 ───────────────────────────────────────────────────────────────────
  const { mutate: sendText } = sendMutation;
  const { mutate: sendImage } = imageMutation;

  const send = useCallback(
    (text: string) => {
      atBottomRef.current = true;
      sendText({ content: text, clientId: newClientId() });
    },
    [sendText],
  );

  const sendImages = useCallback(
    (files: File[]) => {
      atBottomRef.current = true;
      files.forEach((file) => sendImage({ file, clientId: newClientId() }));
    },
    [sendImage],
  );

  const retry = useCallback(
    (m: ChatMessageDTO) => {
      patchMessage(
        qc,
        roomId,
        (x) => x.client_id === m.client_id && x.id < 0,
        () => null,
      );
      if (m.message_type === 'image') {
        if (m._file) sendImages([m._file]);
      } else {
        send(m.content);
      }
    },
    [qc, roomId, send, sendImages],
  );

  const submitEdit = useCallback(
    (id: number, text: string) => {
      editMutation.mutate({ messageId: id, content: text });
      setEditing(null);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [editMutation.mutate],
  );

  const canViewHistory = !!room?.viewer_is_super_admin;
  const actionImageSrc =
    actionTarget?.message_type === 'image'
      ? (actionTarget._localUrl ?? getUploadUrl(actionTarget.attachment_url))
      : undefined;

  // ── 렌더 ───────────────────────────────────────────────────────────────────
  if (roomError) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-3 p-8 text-center">
        <MessageCircleOff className="size-10 text-gray-300" />
        <p className="text-sm text-gray-500">
          채팅방을 찾을 수 없거나 더 이상 참여하지 않는 방입니다.
        </p>
        <button
          type="button"
          onClick={onBack}
          className="rounded-lg bg-mega px-4 py-2 text-sm font-semibold text-white hover:bg-mega-hover"
        >
          목록으로
        </button>
      </div>
    );
  }

  const others = room?.members.filter((m) => m.id !== myId) ?? [];

  return (
    <div className="relative flex h-full min-h-0 flex-col overflow-hidden bg-app-bg">
      {/* 헤더 */}
      <header className="relative z-20 flex shrink-0 items-center gap-1 border-b border-gray-100 bg-white px-2 pt-[max(0.5rem,env(safe-area-inset-top))] pb-2 sm:px-3 lg:pt-2">
        {showBack && (
          <Button variant="ghost" size="icon" onClick={onBack} aria-label="뒤로">
            <ChevronLeft className="size-6" />
          </Button>
        )}
        <button
          type="button"
          onClick={() => setInfoOpen(true)}
          className="flex min-w-0 flex-1 items-center gap-3 rounded-lg px-1.5 py-1 text-left transition-colors hover:bg-gray-50"
        >
          {room ? (
            <RoomAvatar
              isGlobal={room.is_global}
              members={others.length ? others : room.members}
              className="size-10"
            />
          ) : (
            <span className="size-10 animate-pulse rounded-full bg-gray-100" />
          )}
          <span className="min-w-0">
            <span className="flex items-center gap-1.5">
              <span className="truncate text-[15px] font-semibold text-gray-900">
                {room?.name ?? ' '}
              </span>
              {room && !room.notify_enabled && (
                <BellOff className="size-3.5 shrink-0 text-gray-400" />
              )}
            </span>
            <span className="block text-xs text-gray-400">
              {room
                ? room.is_global
                  ? `전체 · ${room.member_count}명`
                  : `${room.member_count}명 참여 중`
                : ''}
            </span>
          </span>
        </button>
        {room && (
          <Button
            variant="ghost"
            size="icon"
            onClick={() => notifyMutation.mutate(!room.notify_enabled)}
            disabled={notifyMutation.isPending}
            aria-label={room.notify_enabled ? '이 방 알림 끄기' : '이 방 알림 켜기'}
            title={room.notify_enabled ? '알림 끄기' : '알림 켜기'}
            className={cn(!room.notify_enabled && 'text-gray-400')}
          >
            {room.notify_enabled ? <Bell className="size-5" /> : <BellOff className="size-5" />}
          </Button>
        )}
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setInfoOpen(true)}
          aria-label="채팅방 정보"
        >
          <Menu className="size-5" />
        </Button>
      </header>

      {/* 메시지 */}
      <div
        ref={scrollRef}
        onScroll={handleScroll}
        className="relative z-10 min-h-0 flex-1 overflow-y-auto overscroll-contain pb-3"
      >
        <div ref={topSentinel} className="h-px" />
        {isFetchingNextPage && (
          <div className="flex justify-center py-3">
            <Spinner className="text-gray-400" />
          </div>
        )}
        {isLoading ? (
          <div className="flex h-full items-center justify-center">
            <Spinner className="size-6 text-gray-300" />
          </div>
        ) : rows.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center gap-2 px-8 text-center">
            <MessagesSquare className="size-8 text-gray-300" />
            <p className="text-sm text-gray-400">첫 메시지를 보내보세요.</p>
          </div>
        ) : (
          rows.map((row) => {
            if (row.kind === 'divider') return <DateDivider key={row.key} label={row.label} />;
            if (row.kind === 'system')
              return <SystemMessage key={row.key} content={row.message.content} />;
            return (
              <MessageBubble
                key={row.key}
                message={row.message}
                isMine={row.isMine}
                isFirst={row.isFirst}
                isLast={row.isLast}
                unreadCount={unreadFor(row.message)}
                canViewHistory={canViewHistory}
                onOpenActions={setActionTarget}
                onOpenImage={setViewerSrc}
                onViewHistory={(m) => setHistoryId(m.id)}
                onRetry={retry}
              />
            );
          })
        )}
        <TypingBubble names={typingNames} />
      </div>

      {/* 새 메시지 알림 */}
      {newCount > 0 && (
        <button
          type="button"
          onClick={() => {
            scrollToBottom(true);
            setNewCount(0);
          }}
          className="absolute bottom-20 left-1/2 z-20 flex -translate-x-1/2 items-center gap-1.5 rounded-full bg-mega px-4 py-2 text-xs font-semibold text-white shadow-md animate-in fade-in"
        >
          <ArrowDown className="size-3.5" />새 메시지 {newCount}개
        </button>
      )}

      {/* 입력 */}
      <div className="relative z-20 shrink-0">
        <ChatComposer
          onSend={send}
          onSendImages={sendImages}
          onTyping={() => chatSocket.sendTyping(roomId)}
          disabled={!room}
          resetKey={roomId}
          editing={editing}
          onSubmitEdit={submitEdit}
          onCancelEdit={() => setEditing(null)}
        />
      </div>

      {room && (
        <RoomInfoSheet
          room={room}
          myId={myId}
          isAdmin={isAdmin}
          open={infoOpen}
          onOpenChange={setInfoOpen}
          onLeft={onBack}
        />
      )}

      <ConfirmDialog
        open={deleteTarget != null}
        title="메시지를 삭제할까요?"
        description="모든 참여자에게 '삭제된 메시지입니다'로 표시됩니다."
        confirmLabel="삭제"
        variant="destructive"
        isPending={deleteMutation.isPending}
        onCancel={() => setDeleteTarget(null)}
        onConfirm={() => {
          if (!deleteTarget) return;
          deleteMutation.mutate(deleteTarget.id, { onSettled: () => setDeleteTarget(null) });
        }}
      />

      {actionTarget && (
        <MessageActionsDialog
          message={actionTarget}
          isMine={actionTarget.sender?.id === myId}
          canViewHistory={canViewHistory}
          imageSrc={actionImageSrc}
          onClose={() => setActionTarget(null)}
          onEdit={(m) => setEditing({ id: m.id, content: m.content })}
          onDelete={setDeleteTarget}
          onViewHistory={(m) => setHistoryId(m.id)}
          onOpenImage={setViewerSrc}
        />
      )}

      <ImageViewerDialog src={viewerSrc} onClose={() => setViewerSrc(null)} />

      {canViewHistory && (
        <EditHistoryDialog
          roomId={roomId}
          messageId={historyId}
          onClose={() => setHistoryId(null)}
        />
      )}
    </div>
  );
};
