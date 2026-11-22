import type {
  ChatMessageDTO,
  ChatMessageHistoryDTO,
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

  setPinned: (roomId: number, pinned: boolean) =>
    apiClient.patch<ChatRoomDetailDTO>({ url: `${BASE}/rooms/${roomId}/pin`, data: { pinned } }),

  messages: (roomId: number, beforeId?: number) =>
    apiClient.get<ChatMessagePageDTO>({
      url: `${BASE}/rooms/${roomId}/messages`,
      params: { before_id: beforeId, limit: 40 },
    }),

  send: (roomId: number, data: SendChatMessageDTO) =>
    apiClient.post<ChatMessageDTO>({ url: `${BASE}/rooms/${roomId}/messages`, data }),

  // interceptors.ts 의 multipart 변환 로직 사용 (data 객체 → FormData)
  sendImage: (roomId: number, file: Blob, fileName: string, clientId: string) =>
    apiClient.post<ChatMessageDTO>({
      url: `${BASE}/rooms/${roomId}/images`,
      data: { file: new File([file], fileName, { type: file.type }), client_id: clientId },
      headers: { 'Content-Type': 'multipart/form-data' },
      timeout: 60_000, // 모바일 네트워크에서 업로드가 기본 5초를 넘길 수 있음
    }),

  editMessage: (roomId: number, messageId: number, content: string) =>
    apiClient.patch<ChatMessageDTO>({
      url: `${BASE}/rooms/${roomId}/messages/${messageId}`,
      data: { content },
    }),

  messageHistory: (roomId: number, messageId: number) =>
    apiClient.get<ChatMessageHistoryDTO>({
      url: `${BASE}/rooms/${roomId}/messages/${messageId}/history`,
    }),

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
