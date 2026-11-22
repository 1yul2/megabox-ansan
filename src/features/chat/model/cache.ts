import type { ChatMessageDTO, ChatMessagePageDTO, ChatRoomDetailDTO } from '../api/dto';
import type { InfiniteData, QueryClient } from '@tanstack/react-query';

import { QUERY_KEYS } from '@/shared/api/queryKeys';

type MessagesData = InfiniteData<ChatMessagePageDTO, unknown>;

/**
 * 메시지 캐시 구조: pages[0] = 가장 최근 페이지, 각 page.items 는 오래된 → 최신 순
 */

/** 새 메시지 추가 (id / client_id 기준 중복 제거 — 낙관적 메시지를 서버 메시지로 교체) */
export function upsertMessage(qc: QueryClient, roomId: number, message: ChatMessageDTO) {
  qc.setQueryData<MessagesData>(QUERY_KEYS.chat.messages(roomId), (data) => {
    if (!data) return data;
    let replaced = false;
    const pages = data.pages.map((page) => {
      const items = page.items.map((m) => {
        if (
          m.id === message.id ||
          (message.client_id && m.client_id === message.client_id && m.id < 0)
        ) {
          replaced = true;
          return { ...message, _status: undefined };
        }
        return m;
      });
      return { ...page, items };
    });
    if (!replaced && pages.length > 0) {
      const first = pages[0];
      pages[0] = { ...first, items: [...first.items, message] };
    }
    // 서버 메시지 id 기준으로 정렬 유지 (낙관적 메시지(id<0)는 맨 뒤)
    pages[0] = {
      ...pages[0],
      items: [...pages[0].items].sort((a, b) => sortKey(a) - sortKey(b)),
    };
    return { ...data, pages };
  });
}

const sortKey = (m: ChatMessageDTO) => (m.id < 0 ? Number.MAX_SAFE_INTEGER + m.id : m.id);

export function patchMessage(
  qc: QueryClient,
  roomId: number,
  match: (m: ChatMessageDTO) => boolean,
  patch: (m: ChatMessageDTO) => ChatMessageDTO | null,
) {
  qc.setQueryData<MessagesData>(QUERY_KEYS.chat.messages(roomId), (data) => {
    if (!data) return data;
    return {
      ...data,
      pages: data.pages.map((page) => ({
        ...page,
        items: page.items.flatMap((m) => {
          if (!match(m)) return [m];
          const next = patch(m);
          return next ? [next] : [];
        }),
      })),
    };
  });
}

export function markMessageDeleted(qc: QueryClient, roomId: number, messageId: number) {
  patchMessage(
    qc,
    roomId,
    (m) => m.id === messageId,
    (m) => ({ ...m, is_deleted: true, content: '' }),
  );
}

export function updateMemberRead(
  qc: QueryClient,
  roomId: number,
  userId: number,
  lastReadMessageId: number,
) {
  qc.setQueryData<ChatRoomDetailDTO>(QUERY_KEYS.chat.room(roomId), (room) => {
    if (!room) return room;
    return {
      ...room,
      members: room.members.map((m) =>
        m.id === userId
          ? { ...m, last_read_message_id: Math.max(m.last_read_message_id, lastReadMessageId) }
          : m,
      ),
    };
  });
}

export function flattenMessages(data: MessagesData | undefined): ChatMessageDTO[] {
  if (!data) return [];
  const out: ChatMessageDTO[] = [];
  for (let i = data.pages.length - 1; i >= 0; i -= 1) out.push(...data.pages[i].items);
  return out;
}

/** 고정한 방 → 그 외, 각 그룹 안에서는 최근 대화 순 (서버 정렬과 동일 — 낙관적 갱신 후에도 순서 보장) */
export function sortRooms<T extends { is_pinned: boolean; last_message_at: string | null }>(
  rooms: T[],
): T[] {
  const time = (r: T) => (r.last_message_at ? new Date(r.last_message_at).getTime() : 0);
  return [...rooms].sort((a, b) => {
    if (a.is_pinned !== b.is_pinned) return a.is_pinned ? -1 : 1;
    return time(b) - time(a);
  });
}
