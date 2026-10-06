import { ChatMessage, Participant, ReactionItem } from '../types/meeting';

export interface RoomStatePayload {
  roomId: string;
  roomName: string;
  hostId: string;
  peers: Array<Omit<Participant, 'isLocal' | 'stream' | 'audioLevel' | 'isSpeaking'>>;
  messages: ChatMessage[];
}

export interface WebSocketServiceCallbacks {
  onRoomState?: (state: RoomStatePayload) => void;
  onPeerJoined?: (peer: Omit<Participant, 'isLocal' | 'stream' | 'audioLevel' | 'isSpeaking'>) => void;
  onPeerLeft?: (peerId: string) => void;
  onPeerUpdated?: (peerId: string, updates: Partial<Participant>) => void;
  onChatMessage?: (message: ChatMessage) => void;
  onReaction?: (reaction: ReactionItem) => void;
  onSignal?: (senderPeerId: string, signal: any) => void;
  onRemoteMuteRequest?: (by: string) => void;
  onKicked?: (reason: string) => void;
  onError?: (error: { code: string; message: string }) => void;
  onConnectionChange?: (connected: boolean) => void;
}

export class WebSocketClient {
  private ws: WebSocket | null = null;
  private callbacks: WebSocketServiceCallbacks = {};
  private reconnectTimer: any = null;
  private isExplicitlyClosed = false;
  private queuedMessages: any[] = [];
  private lastJoinPayload: any = null;

  constructor(callbacks: WebSocketServiceCallbacks = {}) {
    this.callbacks = callbacks;
  }

  public setCallbacks(callbacks: WebSocketServiceCallbacks) {
    this.callbacks = { ...this.callbacks, ...callbacks };
  }

  public connect(): Promise<void> {
    this.isExplicitlyClosed = false;
    return new Promise((resolve, reject) => {
      const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      const host = window.location.host;
      const url = `${protocol}//${host}`;

      try {
        this.ws = new WebSocket(url);
      } catch (err) {
        this.scheduleReconnect();
        return reject(err);
      }

      this.ws.onopen = () => {
        this.callbacks.onConnectionChange?.(true);
        // Flush queue
        while (this.queuedMessages.length > 0) {
          const item = this.queuedMessages.shift();
          this.ws?.send(JSON.stringify(item));
        }

        // Rejoin if previously joined
        if (this.lastJoinPayload) {
          this.send(this.lastJoinPayload);
        }
        resolve();
      };

      this.ws.onmessage = (event) => {
        try {
          const msg = JSON.parse(event.data);
          this.handleIncoming(msg);
        } catch (e) {
          console.error('Failed to parse WebSocket message', e);
        }
      };

      this.ws.onclose = () => {
        this.callbacks.onConnectionChange?.(false);
        if (!this.isExplicitlyClosed) {
          this.scheduleReconnect();
        }
      };

      this.ws.onerror = (err) => {
        console.warn('WebSocket error:', err);
      };
    });
  }

  private handleIncoming(msg: any) {
    switch (msg.type) {
      case 'room-state':
        this.callbacks.onRoomState?.(msg);
        break;
      case 'peer-joined':
        this.callbacks.onPeerJoined?.(msg.peer);
        break;
      case 'peer-left':
        this.callbacks.onPeerLeft?.(msg.peerId);
        break;
      case 'peer-updated':
        this.callbacks.onPeerUpdated?.(msg.peerId, msg.updates);
        break;
      case 'chat-message':
        this.callbacks.onChatMessage?.(msg.message);
        break;
      case 'reaction':
        this.callbacks.onReaction?.({
          id: msg.id,
          emoji: msg.emoji,
          senderName: msg.senderName,
          senderPeerId: msg.senderPeerId,
          xOffset: Math.floor(Math.random() * 80) - 40,
        });
        break;
      case 'signal':
        this.callbacks.onSignal?.(msg.senderPeerId, msg.signal);
        break;
      case 'remote-mute-request':
        this.callbacks.onRemoteMuteRequest?.(msg.by);
        break;
      case 'kicked':
        this.callbacks.onKicked?.(msg.reason);
        break;
      case 'error':
        this.callbacks.onError?.(msg);
        break;
    }
  }

  private send(data: any) {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(data));
    } else {
      this.queuedMessages.push(data);
    }
  }

  private scheduleReconnect() {
    if (this.reconnectTimer) return;
    this.reconnectTimer = setTimeout(() => {
      this.reconnectTimer = null;
      if (!this.isExplicitlyClosed) {
        this.connect().catch(() => {});
      }
    }, 2000);
  }

  public joinRoom(roomId: string, peerId: string, user: any, password?: string) {
    this.lastJoinPayload = {
      type: 'join-room',
      roomId,
      peerId,
      user,
      password,
    };
    this.send(this.lastJoinPayload);
  }

  public sendSignal(targetPeerId: string, signal: any) {
    this.send({
      type: 'signal',
      targetPeerId,
      signal,
    });
  }

  public updatePeer(updates: Partial<Participant>) {
    this.send({
      type: 'peer-update',
      updates,
    });
  }

  public sendChatMessage(text: string, directTo?: string) {
    this.send({
      type: 'chat-message',
      text,
      directTo,
    });
  }

  public sendReaction(emoji: string) {
    this.send({
      type: 'reaction',
      emoji,
    });
  }

  public requestMute(targetPeerId: string) {
    this.send({
      type: 'mute-participant',
      targetPeerId,
    });
  }

  public requestMuteAll() {
    this.send({
      type: 'mute-all',
    });
  }

  public kickPeer(targetPeerId: string) {
    this.send({
      type: 'kick-peer',
      targetPeerId,
    });
  }

  public leaveRoom() {
    this.send({ type: 'leave-room' });
    this.lastJoinPayload = null;
  }

  public disconnect() {
    this.isExplicitlyClosed = true;
    if (this.reconnectTimer) clearTimeout(this.reconnectTimer);
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
  }
}
