import type { ChatMessageDTO } from '../api/dto';

const WEEKDAYS = ['일', '월', '화', '수', '목', '금', '토'];

/** 서버 시간은 KST(오프셋 없음) — 그대로 로컬 시간으로 해석 */
export const parseChatDate = (value: string) => new Date(value);

const sameDay = (a: Date, b: Date) =>
  a.getFullYear() === b.getFullYear() &&
  a.getMonth() === b.getMonth() &&
  a.getDate() === b.getDate();

/** 오후 3:05 */
export function formatClock(value: string): string {
  const d = parseChatDate(value);
  const h = d.getHours();
  const m = String(d.getMinutes()).padStart(2, '0');
  const period = h < 12 ? '오전' : '오후';
  const h12 = h % 12 === 0 ? 12 : h % 12;
  return `${period} ${h12}:${m}`;
}

/** 2026년 11월 22일 일요일 */
export function formatDateDivider(value: string): string {
  const d = parseChatDate(value);
  return `${d.getFullYear()}년 ${d.getMonth() + 1}월 ${d.getDate()}일 ${WEEKDAYS[d.getDay()]}요일`;
}

/** 채팅방 목록용: 오늘 → 시간, 어제 → 어제, 올해 → 11월 3일, 이전 → 2025. 3. 2. */
export function formatRoomTime(value: string | null | undefined): string {
  if (!value) return '';
  const d = parseChatDate(value);
  const now = new Date();
  if (sameDay(d, now)) return formatClock(value);
  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);
  if (sameDay(d, yesterday)) return '어제';
  if (d.getFullYear() === now.getFullYear()) return `${d.getMonth() + 1}월 ${d.getDate()}일`;
  return `${d.getFullYear()}. ${d.getMonth() + 1}. ${d.getDate()}.`;
}

const GROUP_GAP_MS = 3 * 60 * 1000;

export type ChatRow =
  | { kind: 'divider'; key: string; label: string }
  | { kind: 'system'; key: string; message: ChatMessageDTO }
  | {
      kind: 'message';
      key: string;
      message: ChatMessageDTO;
      isMine: boolean;
      /** 같은 사람의 연속 메시지 중 첫 번째 (아바타·이름 표시) */
      isFirst: boolean;
      /** 연속 메시지 중 마지막 (시간 표시) */
      isLast: boolean;
    };

/** 날짜 구분선 + 연속 메시지 묶음 계산 */
export function buildRows(messages: ChatMessageDTO[], myId: number | undefined): ChatRow[] {
  const rows: ChatRow[] = [];
  let prevDate: Date | null = null;

  messages.forEach((m, i) => {
    const date = parseChatDate(m.created_at);
    if (!prevDate || !sameDay(prevDate, date)) {
      rows.push({ kind: 'divider', key: `d-${m.id}`, label: formatDateDivider(m.created_at) });
    }
    prevDate = date;

    if (m.message_type === 'system') {
      rows.push({ kind: 'system', key: `s-${m.id}`, message: m });
      return;
    }

    const prev = messages[i - 1];
    const next = messages[i + 1];
    const continues = (a: ChatMessageDTO | undefined, b: ChatMessageDTO) =>
      !!a &&
      a.message_type !== 'system' &&
      a.sender?.id === b.sender?.id &&
      sameDay(parseChatDate(a.created_at), parseChatDate(b.created_at)) &&
      Math.abs(parseChatDate(b.created_at).getTime() - parseChatDate(a.created_at).getTime()) <
        GROUP_GAP_MS;

    rows.push({
      kind: 'message',
      key: m.client_id && m.id < 0 ? `c-${m.client_id}` : `m-${m.id}`,
      message: m,
      isMine: m.sender?.id === myId,
      isFirst: !continues(prev, m),
      isLast:
        !next || !continues(m, next) || formatClock(next.created_at) !== formatClock(m.created_at),
    });
  });
  return rows;
}

const URL_RE = /(https?:\/\/[^\s<]+[^\s<.,:;"')\]!?])/g;

/** 텍스트를 [일반, 링크] 조각으로 분리 */
export function splitLinks(text: string): { text: string; href?: string }[] {
  const parts: { text: string; href?: string }[] = [];
  let last = 0;
  for (const match of text.matchAll(URL_RE)) {
    const idx = match.index ?? 0;
    if (idx > last) parts.push({ text: text.slice(last, idx) });
    parts.push({ text: match[0], href: match[0] });
    last = idx + match[0].length;
  }
  if (last < text.length) parts.push({ text: text.slice(last) });
  return parts;
}

export const newClientId = () =>
  typeof crypto !== 'undefined' && 'randomUUID' in crypto
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.random().toString(36).slice(2)}`;
