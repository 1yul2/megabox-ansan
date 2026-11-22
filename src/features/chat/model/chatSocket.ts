import type { ChatSocketEvent } from '../api/dto';

import { BASE_URL } from '@/shared/api/apiClients';

type Listener = (event: ChatSocketEvent) => void;
type StatusListener = (connected: boolean) => void;

const PING_INTERVAL = 30_000;
const MAX_BACKOFF = 15_000;

function buildWsUrl(): string {
  const url = new URL('/api/chat/ws', BASE_URL || window.location.origin);
  url.protocol = url.protocol === 'https:' ? 'wss:' : 'ws:';
  return url.toString();
}

/**
 * 앱 전체에서 1개만 유지하는 채팅 소켓
 * - 연결 직후 첫 메시지로 토큰 인증 (URL 쿼리에 토큰을 싣지 않음)
 * - 끊기면 지수 백오프로 재연결, 탭이 다시 보이거나 온라인이 되면 즉시 재연결
 */
class ChatSocket {
  private ws: WebSocket | null = null;
  private listeners = new Set<Listener>();
  private statusListeners = new Set<StatusListener>();
  private getToken: (() => string | null) | null = null;
  private retry = 0;
  private reconnectTimer: ReturnType<typeof setTimeout> | null = null;
  private pingTimer: ReturnType<typeof setInterval> | null = null;
  private viewingRoomId: number | null = null;
  private stopped = true;
  private authed = false;

  start(getToken: () => string | null) {
    this.getToken = getToken;
    if (!this.stopped) return;
    this.stopped = false;
    window.addEventListener('online', this.handleWake);
    document.addEventListener('visibilitychange', this.handleVisibility);
    this.connect();
  }

  stop() {
    this.stopped = true;
    window.removeEventListener('online', this.handleWake);
    document.removeEventListener('visibilitychange', this.handleVisibility);
    this.clearTimers();
    this.ws?.close(1000);
    this.ws = null;
    this.setAuthed(false);
  }

  subscribe(listener: Listener) {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  onStatus(listener: StatusListener) {
    this.statusListeners.add(listener);
    listener(this.authed);
    return () => this.statusListeners.delete(listener);
  }

  get connected() {
    return this.authed;
  }

  /** 현재 보고 있는 방 (서버가 이 방의 푸시 알림을 보내지 않음) */
  setViewing(roomId: number | null) {
    this.viewingRoomId = roomId;
    this.sendView();
  }

  sendTyping(roomId: number) {
    this.send({ type: 'typing', room_id: roomId });
  }

  // ── 내부 ──────────────────────────────────────────────────────────────────

  private connect() {
    if (this.stopped) return;
    const token = this.getToken?.();
    if (!token) {
      this.scheduleReconnect();
      return;
    }
    if (
      this.ws &&
      (this.ws.readyState === WebSocket.OPEN || this.ws.readyState === WebSocket.CONNECTING)
    ) {
      return;
    }

    let ws: WebSocket;
    try {
      ws = new WebSocket(buildWsUrl());
    } catch {
      this.scheduleReconnect();
      return;
    }
    this.ws = ws;

    ws.onopen = () => {
      ws.send(JSON.stringify({ type: 'auth', token }));
    };

    ws.onmessage = (e: MessageEvent<string>) => {
      let event: ChatSocketEvent;
      try {
        event = JSON.parse(e.data) as ChatSocketEvent;
      } catch {
        return;
      }
      if (event.type === 'auth:ok') {
        this.retry = 0;
        this.setAuthed(true);
        this.sendView();
        this.startPing();
      }
      this.listeners.forEach((l) => l(event));
    };

    ws.onclose = () => {
      if (this.ws === ws) this.ws = null;
      this.clearTimers();
      this.setAuthed(false);
      this.scheduleReconnect();
    };

    ws.onerror = () => {
      ws.close();
    };
  }

  private send(payload: Record<string, unknown>) {
    if (this.ws?.readyState === WebSocket.OPEN && this.authed) {
      this.ws.send(JSON.stringify(payload));
    }
  }

  private sendView() {
    // 탭이 숨겨져 있으면 '보고 있지 않음'으로 알려 푸시를 받도록 한다
    const roomId = document.visibilityState === 'visible' ? this.viewingRoomId : null;
    this.send({ type: 'view', room_id: roomId });
  }

  private startPing() {
    if (this.pingTimer) clearInterval(this.pingTimer);
    this.pingTimer = setInterval(() => this.send({ type: 'ping' }), PING_INTERVAL);
  }

  private scheduleReconnect() {
    if (this.stopped || this.reconnectTimer) return;
    const delay = Math.min(MAX_BACKOFF, 1000 * 2 ** this.retry) + Math.random() * 500;
    this.retry += 1;
    this.reconnectTimer = setTimeout(() => {
      this.reconnectTimer = null;
      this.connect();
    }, delay);
  }

  private clearTimers() {
    if (this.pingTimer) clearInterval(this.pingTimer);
    this.pingTimer = null;
    if (this.reconnectTimer) clearTimeout(this.reconnectTimer);
    this.reconnectTimer = null;
  }

  private setAuthed(value: boolean) {
    if (this.authed === value) return;
    this.authed = value;
    this.statusListeners.forEach((l) => l(value));
  }

  private handleWake = () => {
    this.retry = 0;
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
    this.connect();
  };

  private handleVisibility = () => {
    if (document.visibilityState === 'visible') this.handleWake();
    this.sendView();
  };
}

export const chatSocket = new ChatSocket();
