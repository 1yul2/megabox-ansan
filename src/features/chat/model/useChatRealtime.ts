import { useQueryClient } from '@tanstack/react-query';
import { useEffect, useRef, useSyncExternalStore } from 'react';

import { markMessageDeleted, patchMessage, updateMemberRead, upsertMessage } from './cache';
import { chatSocket } from './chatSocket';
import { useTypingStore } from './typingStore';

import type { ChatSocketEvent } from '../api/dto';

import { QUERY_KEYS } from '@/shared/api/queryKeys';
import { useAuthStore } from '@/shared/model/authStore';

/**
 * 앱 레이아웃에서 1번만 호출 — 소켓 연결 + 이벤트를 React Query 캐시에 반영
 */
export function useChatRealtime(enabled: boolean) {
  const qc = useQueryClient();
  const wasConnected = useRef(false);

  useEffect(() => {
    if (!enabled) {
      chatSocket.stop();
      return;
    }
    chatSocket.start(() => useAuthStore.getState().accessToken);

    // 목록/배지 갱신은 이벤트가 몰릴 때 한 번으로 묶는다
    let listTimer: ReturnType<typeof setTimeout> | null = null;
    const refreshLists = () => {
      if (listTimer) return;
      listTimer = setTimeout(() => {
        listTimer = null;
        void qc.invalidateQueries({ queryKey: QUERY_KEYS.chat.rooms() });
        void qc.invalidateQueries({ queryKey: QUERY_KEYS.chat.unread() });
      }, 250);
    };

    const { setTyping, clearUser, prune } = useTypingStore.getState();
    const pruneTimer = setInterval(prune, 1500);

    const unsubscribe = chatSocket.subscribe((event: ChatSocketEvent) => {
      switch (event.type) {
        case 'message:new':
          upsertMessage(qc, event.room_id, event.message);
          if (event.message.sender) clearUser(event.room_id, event.message.sender.id);
          if (event.message.message_type === 'system') {
            void qc.invalidateQueries({ queryKey: QUERY_KEYS.chat.room(event.room_id) });
          }
          refreshLists();
          break;
        case 'message:updated': {
          // 수정은 이미 불러온 메시지에만 반영 (목록에 없는 오래된 메시지를 끝에 붙이지 않음)
          const updated = event.message;
          patchMessage(
            qc,
            event.room_id,
            (m) => m.id === updated.id,
            () => updated,
          );
          refreshLists();
          break;
        }
        case 'message:deleted':
          markMessageDeleted(qc, event.room_id, event.message_id);
          refreshLists();
          break;
        case 'room:read':
          updateMemberRead(qc, event.room_id, event.user_id, event.last_read_message_id);
          break;
        case 'room:updated':
          void qc.invalidateQueries({ queryKey: QUERY_KEYS.chat.room(event.room_id) });
          refreshLists();
          break;
        case 'room:removed':
          qc.removeQueries({ queryKey: QUERY_KEYS.chat.messages(event.room_id) });
          void qc.invalidateQueries({ queryKey: QUERY_KEYS.chat.room(event.room_id) });
          refreshLists();
          break;
        case 'typing':
          setTyping(event.room_id, event.user_id, event.name);
          break;
        case 'auth:error':
          // 토큰 만료 — 아무 API나 호출해 인터셉터의 토큰 갱신을 유도 (다음 재연결은 새 토큰 사용)
          void qc.invalidateQueries({ queryKey: QUERY_KEYS.chat.unread() });
          break;
        default:
          break;
      }
    });

    // 재연결 시 끊겨 있던 동안의 메시지를 다시 불러온다
    const offStatus = chatSocket.onStatus((connected) => {
      if (connected && wasConnected.current === false) {
        void qc.invalidateQueries({ queryKey: QUERY_KEYS.chat.base });
      }
      wasConnected.current = connected;
    });

    return () => {
      unsubscribe();
      offStatus();
      clearInterval(pruneTimer);
      if (listTimer) clearTimeout(listTimer);
    };
  }, [enabled, qc]);

  useEffect(() => () => chatSocket.stop(), []);
}

/** 소켓 연결 상태 구독 */
export function useChatConnected(): boolean {
  return useSyncExternalStore(
    (cb) => chatSocket.onStatus(cb),
    () => chatSocket.connected,
    () => false,
  );
}
