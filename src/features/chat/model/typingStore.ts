import { create } from 'zustand';

const TYPING_TTL = 4000;

type TypingEntry = { name: string; expiresAt: number };

interface TypingState {
  /** roomId → userId → entry */
  rooms: Record<number, Record<number, TypingEntry>>;
  setTyping: (roomId: number, userId: number, name: string) => void;
  clearUser: (roomId: number, userId: number) => void;
  prune: () => void;
}

export const useTypingStore = create<TypingState>((set) => ({
  rooms: {},
  setTyping: (roomId, userId, name) =>
    set((s) => ({
      rooms: {
        ...s.rooms,
        [roomId]: { ...s.rooms[roomId], [userId]: { name, expiresAt: Date.now() + TYPING_TTL } },
      },
    })),
  clearUser: (roomId, userId) =>
    set((s) => {
      if (!s.rooms[roomId]?.[userId]) return s;
      const next = { ...s.rooms[roomId] };
      delete next[userId];
      return { rooms: { ...s.rooms, [roomId]: next } };
    }),
  prune: () =>
    set((s) => {
      const now = Date.now();
      let changed = false;
      const rooms: TypingState['rooms'] = {};
      for (const [rid, users] of Object.entries(s.rooms)) {
        const kept: Record<number, TypingEntry> = {};
        for (const [uid, entry] of Object.entries(users)) {
          if (entry.expiresAt > now) kept[Number(uid)] = entry;
          else changed = true;
        }
        rooms[Number(rid)] = kept;
      }
      return changed ? { rooms } : s;
    }),
}));

const EMPTY: string[] = [];

/** 특정 방에서 입력 중인 사람 이름 목록 */
export function useTypingNames(roomId: number): string[] {
  const users = useTypingStore((s) => s.rooms[roomId]);
  if (!users) return EMPTY;
  const now = Date.now();
  return Object.values(users)
    .filter((u) => u.expiresAt > now)
    .map((u) => u.name);
}
