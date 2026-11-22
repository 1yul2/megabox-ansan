export interface ChatUserDTO {
  id: number;
  name: string;
  position: string;
  gender?: string | null;
  profile_image?: string | null;
}

export interface ChatMemberDTO extends ChatUserDTO {
  last_read_message_id: number;
  is_owner: boolean;
}

export type ChatMessageType = 'text' | 'image' | 'system';

export interface ChatMessageDTO {
  id: number;
  room_id: number;
  sender: ChatUserDTO | null;
  message_type: ChatMessageType;
  content: string;
  is_deleted: boolean;
  created_at: string; // ISO (KST, offset 없음)
  client_id?: string | null;
  attachment_url?: string | null;
  attachment_width?: number | null;
  attachment_height?: number | null;
  is_edited?: boolean;
  edited_at?: string | null;
  /** 프론트 전용 — 낙관적 전송 상태 */
  _status?: 'sending' | 'failed';
  /** 프론트 전용 — 전송 중 이미지 미리보기 (object URL) */
  _localUrl?: string;
  /** 프론트 전용 — 실패 시 재전송용 원본 파일 */
  _file?: File;
}

export interface ChatMessageVersionDTO {
  content: string;
  created_at: string;
  is_current: boolean;
}

export interface ChatMessageHistoryDTO {
  message_id: number;
  versions: ChatMessageVersionDTO[];
}

export interface ChatMessagePageDTO {
  items: ChatMessageDTO[];
  has_more: boolean;
}

export interface ChatLastMessageDTO {
  id: number;
  message_type: ChatMessageType;
  content: string;
  sender_name: string | null;
  is_deleted: boolean;
  created_at: string;
}

export interface ChatRoomSummaryDTO {
  id: number;
  name: string;
  custom_name: string | null;
  is_global: boolean;
  is_owner: boolean;
  member_count: number;
  unread_count: number;
  notify_enabled: boolean;
  is_pinned: boolean;
  last_message: ChatLastMessageDTO | null;
  last_message_at: string | null;
  member_preview: ChatUserDTO[];
}

export interface ChatRoomDetailDTO extends ChatRoomSummaryDTO {
  members: ChatMemberDTO[];
  viewer_is_super_admin: boolean;
}

export interface CreateChatRoomDTO {
  name?: string;
  member_ids: number[];
}

export interface SendChatMessageDTO {
  content: string;
  client_id?: string;
}

// ─── 실시간 이벤트 (서버 → 클라이언트) ────────────────────────────────────────

export type ChatSocketEvent =
  | { type: 'auth:ok'; user_id: number }
  | { type: 'auth:error' }
  | { type: 'pong' }
  | { type: 'message:new'; room_id: number; message: ChatMessageDTO }
  | { type: 'message:updated'; room_id: number; message: ChatMessageDTO }
  | { type: 'message:deleted'; room_id: number; message_id: number }
  | { type: 'room:read'; room_id: number; user_id: number; last_read_message_id: number }
  | { type: 'room:updated'; room_id: number }
  | { type: 'room:removed'; room_id: number }
  | { type: 'typing'; room_id: number; user_id: number; name: string };
