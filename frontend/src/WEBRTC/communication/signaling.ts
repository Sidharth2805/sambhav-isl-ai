import type { WebRTCSignalingMessage, SignalingRole } from '../types/communication';

export function getSignalingServerUrl(): string {
  if (import.meta.env.VITE_WS_URL) {
    return import.meta.env.VITE_WS_URL;
  }
  if (import.meta.env.VITE_SIGNALING_URL) {
    return import.meta.env.VITE_SIGNALING_URL;
  }

  const backendHttpUrl =
    import.meta.env.VITE_API_URL ||
    import.meta.env.VITE_API_BASE_URL ||
    (import.meta.env.DEV ? 'http://localhost:8080' : 'https://signbridge-backend-k4k5.onrender.com');

  try {
    const parsed = new URL(backendHttpUrl);
    const wsProto = parsed.protocol === 'https:' ? 'wss:' : 'ws:';
    const hostWithPort = parsed.port ? `${parsed.hostname}:${parsed.port}` : parsed.host;
    return `${wsProto}//${hostWithPort}/ws/webrtc`;
  } catch {
    const isDev = import.meta.env.DEV || window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
    if (isDev) {
      return `ws://${window.location.hostname || 'localhost'}:8080/ws/webrtc`;
    }
    return `wss://signbridge-backend-k4k5.onrender.com/ws/webrtc`;
  }
}

export type SignalingMessageHandler = (msg: WebRTCSignalingMessage) => void;

export class WebRTCSignalingClient {
  private ws: WebSocket | null = null;
  private roomId: string;
  private role: SignalingRole;
  private heartbeatInterval: ReturnType<typeof setInterval> | null = null;
  private messageHandlers: Set<SignalingMessageHandler> = new Set();

  constructor(roomId: string, role: SignalingRole) {
    this.roomId = roomId.trim().toUpperCase();
    this.role = role;
  }

  public connect(): Promise<void> {
    const url = getSignalingServerUrl();

    return new Promise((resolve) => {
      console.log(`[WEBRTC Signaling] Connecting to ${url} for room ${this.roomId}`);
      this.ws = new WebSocket(url);

      this.ws.onopen = () => {
        console.log(`[WEBRTC Signaling] WebSocket connected. Joining room ${this.roomId} as ${this.role}`);
        this.send({
          type: 'join',
          roomId: this.roomId,
          role: this.role,
        });

        // Start 20s heartbeat to avoid cloud proxy timeouts
        this.heartbeatInterval = setInterval(() => {
          if (this.ws?.readyState === WebSocket.OPEN) {
            this.send({ type: 'ping' });
          }
        }, 20000);

        resolve();
      };

      this.ws.onmessage = (event) => {
        try {
          const msg: WebRTCSignalingMessage = JSON.parse(event.data);
          if (msg.type === 'pong') return;
          this.notifyHandlers(msg);
        } catch (err) {
          console.error('[WEBRTC Signaling] Error parsing message:', err);
        }
      };

      this.ws.onerror = (err) => {
        console.warn('[WEBRTC Signaling] WebSocket error:', err);
        resolve(); // resolve so caller continues lifecycle
      };

      this.ws.onclose = () => {
        console.log('[WEBRTC Signaling] WebSocket closed');
        if (this.heartbeatInterval) {
          clearInterval(this.heartbeatInterval);
          this.heartbeatInterval = null;
        }
      };
    });
  }

  public onMessage(handler: SignalingMessageHandler): () => void {
    this.messageHandlers.add(handler);
    return () => this.messageHandlers.delete(handler);
  }

  private notifyHandlers(msg: WebRTCSignalingMessage) {
    this.messageHandlers.forEach((handler) => {
      try {
        handler(msg);
      } catch (err) {
        console.error('[WEBRTC Signaling] Handler exception:', err);
      }
    });
  }

  public send(msg: Partial<WebRTCSignalingMessage>) {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(msg));
    }
  }

  public sendSignal(data: { type: 'offer' | 'answer' | 'candidate'; sdp?: RTCSessionDescriptionInit; candidate?: RTCIceCandidateInit }) {
    this.send({
      type: 'signal',
      roomId: this.roomId,
      data,
    });
  }

  public sendAppMessage(payload: Record<string, any>) {
    this.send({
      type: 'app-message',
      roomId: this.roomId,
      fromRole: this.role,
      payload,
    });
  }

  public close() {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
      this.heartbeatInterval = null;
    }
    if (this.ws) {
      if (this.ws.readyState === WebSocket.OPEN) {
        try {
          this.send({ type: 'leave', roomId: this.roomId });
        } catch (_) {}
      }
      this.ws.close();
      this.ws = null;
    }
    this.messageHandlers.clear();
  }

  public get isOpen(): boolean {
    return this.ws?.readyState === WebSocket.OPEN;
  }
}
