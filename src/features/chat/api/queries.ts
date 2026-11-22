import {
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient,
  keepPreviousData,
} from '@tanstack/react-query';
import { toast } from 'sonner';

import { patchMessage, upsertMessage, markMessageDeleted } from '../model/cache';

import { chatService } from './service';

import type { ChatMessageDTO, CreateChatRoomDTO } from './dto';
import type { User } from '@/entities/user/model/user';

import { QUERY_KEYS } from '@/shared/api/queryKeys';
import { useAuthStore } from '@/shared/model/authStore';

const errorMessage = (e: unknown, fallback: string) =>
  e instanceof Error && e.message ? e.message : fallback;

// ─── 조회 ────────────────────────────────────────────────────────────────────

export function useChatRoomsQuery() {
  return useQuery({
    queryKey: QUERY_KEYS.chat.rooms(),
    queryFn: chatService.rooms,
    staleTime: 15_000,
  });
}

export function useChatRoomQuery(roomId: number | null) {
  return useQuery({
    queryKey: QUERY_KEYS.chat.room(roomId ?? 0),
    queryFn: () => chatService.room(roomId as number),
    enabled: roomId != null && roomId > 0,
    retry: false,
  });
}

export function useChatMessagesQuery(roomId: number | null) {
  return useInfiniteQuery({
    queryKey: QUERY_KEYS.chat.messages(roomId ?? 0),
    queryFn: ({ pageParam }) => chatService.messages(roomId as number, pageParam),
    initialPageParam: undefined as number | undefined,
    // pages[0] = 최신, 다음 페이지 = 더 오래된 메시지
    getNextPageParam: (lastPage) =>
      lastPage.has_more && lastPage.items.length > 0 ? lastPage.items[0].id : undefined,
    enabled: roomId != null && roomId > 0,
    retry: false,
    staleTime: Infinity, // 실시간 소켓으로 갱신 (재연결 시 invalidate)
  });
}

export function useChatUnreadQuery() {
  const accessToken = useAuthStore((s) => s.accessToken);
  return useQuery({
    queryKey: QUERY_KEYS.chat.unread(),
    queryFn: chatService.unreadCount,
    enabled: !!accessToken,
    refetchInterval: 60_000, // 소켓이 끊겨도 배지가 크게 어긋나지 않도록
  });
}

export function useChatUsersQuery(q: string, enabled = true) {
  return useQuery({
    queryKey: QUERY_KEYS.chat.users(q),
    queryFn: () => chatService.users(q || undefined),
    enabled,
    placeholderData: keepPreviousData,
    staleTime: 60_000,
  });
}

// ─── 변경 ────────────────────────────────────────────────────────────────────

export function useCreateChatRoomMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateChatRoomDTO) => chatService.createRoom(data),
    onSuccess: (room) => {
      qc.setQueryData(QUERY_KEYS.chat.room(room.id), room);
      void qc.invalidateQueries({ queryKey: QUERY_KEYS.chat.rooms() });
    },
    onError: (e) => toast.error(errorMessage(e, '채팅방을 만들지 못했습니다.')),
  });
}

export function useRenameChatRoomMutation(roomId: number) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (name: string | null) => chatService.renameRoom(roomId, name),
    onSuccess: (room) => {
      qc.setQueryData(QUERY_KEYS.chat.room(roomId), room);
      void qc.invalidateQueries({ queryKey: QUERY_KEYS.chat.rooms() });
      toast.success('채팅방 이름을 변경했습니다.');
    },
    onError: (e) => toast.error(errorMessage(e, '이름을 변경하지 못했습니다.')),
  });
}

export function useInviteChatMutation(roomId: number) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (userIds: number[]) => chatService.invite(roomId, userIds),
    onSuccess: (room) => {
      qc.setQueryData(QUERY_KEYS.chat.room(roomId), room);
      void qc.invalidateQueries({ queryKey: QUERY_KEYS.chat.rooms() });
      toast.success('초대했습니다.');
    },
    onError: (e) => toast.error(errorMessage(e, '초대하지 못했습니다.')),
  });
}

export function useLeaveChatMutation(roomId: number) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => chatService.leave(roomId),
    onSuccess: () => {
      qc.removeQueries({ queryKey: QUERY_KEYS.chat.room(roomId) });
      qc.removeQueries({ queryKey: QUERY_KEYS.chat.messages(roomId) });
      void qc.invalidateQueries({ queryKey: QUERY_KEYS.chat.rooms() });
      void qc.invalidateQueries({ queryKey: QUERY_KEYS.chat.unread() });
    },
    onError: (e) => toast.error(errorMessage(e, '채팅방을 나가지 못했습니다.')),
  });
}

export function useChatNotificationMutation(roomId: number) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (enabled: boolean) => chatService.setNotification(roomId, enabled),
    onSuccess: (room) => {
      qc.setQueryData(QUERY_KEYS.chat.room(roomId), room);
      void qc.invalidateQueries({ queryKey: QUERY_KEYS.chat.rooms() });
      toast.success(
        room.notify_enabled ? '이 채팅방 알림을 켰습니다.' : '이 채팅방 알림을 껐습니다.',
      );
    },
    onError: (e) => toast.error(errorMessage(e, '알림 설정을 변경하지 못했습니다.')),
  });
}

/** 낙관적 전송 — 즉시 말풍선 표시 → 서버 응답/소켓 이벤트로 교체 */
export function useSendChatMessageMutation(roomId: number, me: User | undefined) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ content, clientId }: { content: string; clientId: string }) =>
      chatService.send(roomId, { content, client_id: clientId }),
    onMutate: ({ content, clientId }) => {
      if (!me) return;
      const temp: ChatMessageDTO = {
        id: -Date.now(),
        room_id: roomId,
        sender: {
          id: Number(me.id),
          name: me.name,
          position: me.position,
          gender: null,
          profile_image: null,
        },
        message_type: 'text',
        content,
        is_deleted: false,
        created_at: new Date().toISOString(),
        client_id: clientId,
        _status: 'sending',
      };
      upsertMessage(qc, roomId, temp);
    },
    onSuccess: (message) => {
      upsertMessage(qc, roomId, message);
      void qc.invalidateQueries({ queryKey: QUERY_KEYS.chat.rooms() });
    },
    onError: (_e, { clientId }) => {
      patchMessage(
        qc,
        roomId,
        (m) => m.client_id === clientId && m.id < 0,
        (m) => ({ ...m, _status: 'failed' }),
      );
    },
  });
}

export function useDeleteChatMessageMutation(roomId: number) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (messageId: number) => chatService.deleteMessage(roomId, messageId),
    onSuccess: (_r, messageId) => {
      markMessageDeleted(qc, roomId, messageId);
      void qc.invalidateQueries({ queryKey: QUERY_KEYS.chat.rooms() });
    },
    onError: (e) => toast.error(errorMessage(e, '메시지를 삭제하지 못했습니다.')),
  });
}

export function useMarkChatReadMutation(roomId: number) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (lastMessageId: number) => chatService.markRead(roomId, lastMessageId),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: QUERY_KEYS.chat.rooms() });
      void qc.invalidateQueries({ queryKey: QUERY_KEYS.chat.unread() });
    },
  });
}
