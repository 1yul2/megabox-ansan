import type {
  ChatMessageDTO,
  ChatMessagePageDTO,
  ChatRoomDetailDTO,
  ChatRoomSummaryDTO,
  ChatUserDTO,
  CreateChatRoomDTO,
  SendChatMessageDTO,
} from './dto';

import { apiClient } from '@/shared/api/apiClients';

const BASE = '/api/chat';

export const chatService = {
  rooms: () => apiClient.get<ChatRoomSummaryDTO[]>({ url: `${BASE}/rooms` }),

  room: (roomId: number) => apiClient.get<ChatRoomDetailDTO>({ url: `${BASE}/rooms/${roomId}` }),

  createRoom: (data: CreateChatRoomDTO) =>
    apiClient.post<ChatRoomDetailDTO>({ url: `${BASE}/rooms`, data }),

  renameRoom: (roomId: number, name: string | null) =>
    apiClient.patch<ChatRoomDetailDTO>({ url: `${BASE}/rooms/${roomId}`, data: { name } }),

  invite: (roomId: number, userIds: number[]) =>
    apiClient.post<ChatRoomDetailDTO>({
      url: `${BASE}/rooms/${roomId}/invite`,
      data: { user_ids: userIds },
    }),

  leave: (roomId: number) =>
    apiClient.post<{ success: boolean }>({ url: `${BASE}/rooms/${roomId}/leave` }),

  setNotification: (roomId: number, enabled: boolean) =>
    apiClient.patch<ChatRoomDetailDTO>({
      url: `${BASE}/rooms/${roomId}/notification`,
      data: { enabled },
    }),

  messages: (roomId: number, beforeId?: number) =>
    apiClient.get<ChatMessagePageDTO>({
      url: `${BASE}/rooms/${roomId}/messages`,
      params: { before_id: beforeId, limit: 40 },
    }),

  send: (roomId: number, data: SendChatMessageDTO) =>
    apiClient.post<ChatMessageDTO>({ url: `${BASE}/rooms/${roomId}/messages`, data }),

  deleteMessage: (roomId: number, messageId: number) =>
    apiClient.delete<{ success: boolean }>({
      url: `${BASE}/rooms/${roomId}/messages/${messageId}`,
    }),

  markRead: (roomId: number, lastMessageId: number) =>
    apiClient.post<{ last_read_message_id: number }>({
      url: `${BASE}/rooms/${roomId}/read`,
      data: { last_message_id: lastMessageId },
    }),

  unreadCount: () => apiClient.get<{ count: number }>({ url: `${BASE}/unread-count` }),

  users: (q?: string) =>
    apiClient.get<ChatUserDTO[]>({ url: `${BASE}/users`, params: q ? { q } : undefined }),
};
