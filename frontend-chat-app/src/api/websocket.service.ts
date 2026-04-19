import { Client } from "@stomp/stompjs";
import SockJS from "sockjs-client";
import type {
  MessageDTO,
  StompDeliveryReceiptPayload,
  StompReadReceiptPayload,
  StompTypingPayload,
} from "@/types";
import type { CallSignalPayload } from "@/hooks/useCall";

export interface StompMessagePayload {
  conversationId: number;
  content: string;
  attachmentUrl?: string;
  attachmentType?: string;
}

type Handler<T> = (payload: T) => void;

export interface PresencePayload {
  userId: number;
  online: boolean;
}

interface Subs {
  onMessage: Set<Handler<MessageDTO>>;
  onDelivered: Set<Handler<StompDeliveryReceiptPayload>>;
  onRead: Set<Handler<StompReadReceiptPayload>>;
  onTyping: Set<Handler<StompTypingPayload>>;
  onPresence: Set<Handler<PresencePayload>>;
  onSignal: Set<Handler<CallSignalPayload>>;
  onConnected: Set<() => void>;
  onDisconnected: Set<() => void>;
}

class StompService {
  private client: Client | null = null;
  private activeToken: string | null = null;
  private connecting: boolean = false;

  private subs: Subs = {
    onMessage: new Set(),
    onDelivered: new Set(),
    onRead: new Set(),
    onTyping: new Set(),
    onPresence: new Set(),
    onSignal: new Set(),
    onConnected: new Set(),
    onDisconnected: new Set(),
  };

  connect(token: string): void {
    if (
      (this.client?.active || this.connecting) &&
      this.activeToken === token
    ) {
      return;
    }
    this.client?.deactivate();
    this.activeToken = token;
    this.connecting = true;

    const isProd = import.meta.env.PROD;
    const wsUrl = isProd ? "http://localhost:8080/ws" : "/ws";

    this.client = new Client({
      webSocketFactory: () => new SockJS(wsUrl) as WebSocket,
      connectHeaders: { Authorization: `Bearer ${token}` },
      reconnectDelay: 3000,
      heartbeatIncoming: 10000,
      heartbeatOutgoing: 10000,
      onConnect: () => {
        this.connecting = false;
        this.subscribeAll();
        this.subs.onConnected.forEach((h) => h());
      },
      onDisconnect: () => {
        this.connecting = false;
        this.subs.onDisconnected.forEach((h) => h());
      },
      onStompError: (frame) => {
        this.connecting = false;
      },
      onWebSocketError: () => {
        this.connecting = false;
      },
      onWebSocketClose: () => {
        this.connecting = false;
      },
    });

    this.client.activate();
  }

  disconnect(): void {
    this.client?.deactivate();
    this.client = null;
    this.activeToken = null;
    this.connecting = false;
  }

  get connected(): boolean {
    return this.client?.active === true;
  }

  private subscribeAll(): void {
    if (!this.client) return;

    this.client.subscribe("/user/queue/messages", (f) => {
      this.subs.onMessage.forEach((h) => h(JSON.parse(f.body) as MessageDTO));
    });
    this.client.subscribe("/user/queue/delivered", (f) => {
      this.subs.onDelivered.forEach((h) =>
        h(JSON.parse(f.body) as StompDeliveryReceiptPayload),
      );
    });
    this.client.subscribe("/user/queue/read", (f) => {
      this.subs.onRead.forEach((h) =>
        h(JSON.parse(f.body) as StompReadReceiptPayload),
      );
    });
    this.client.subscribe("/user/queue/typing", (f) => {
      this.subs.onTyping.forEach((h) =>
        h(JSON.parse(f.body) as StompTypingPayload),
      );
    });
    this.client.subscribe("/user/queue/presence", (f) => {
      this.subs.onPresence.forEach((h) =>
        h(JSON.parse(f.body) as PresencePayload),
      );
    });
    this.client.subscribe("/user/queue/signal", (f) => {
      this.subs.onSignal.forEach((h) =>
        h(JSON.parse(f.body) as CallSignalPayload),
      );
    });
  }

  private publish(destination: string, body: unknown): void {
    if (!this.client?.active) {
      return;
    }
    this.client.publish({ destination, body: JSON.stringify(body) });
  }

  sendMessage(p: StompMessagePayload): void {
    this.publish("/app/chat.send", p);
  }

  sendTyping(p: StompTypingPayload): void {
    this.publish("/app/chat.typing", p);
  }
  sendRead(p: StompReadReceiptPayload): void {
    this.publish("/app/chat.read", p);
  }
  sendDelivered(p: StompDeliveryReceiptPayload): void {
    this.publish("/app/chat.delivered", p);
  }
  sendSignal(p: CallSignalPayload): void {
    this.publish("/app/chat.signal", p);
  }

  onMessage(h: Handler<MessageDTO>): () => void {
    this.subs.onMessage.add(h);
    return () => this.subs.onMessage.delete(h);
  }
  onDelivered(h: Handler<StompDeliveryReceiptPayload>): () => void {
    this.subs.onDelivered.add(h);
    return () => this.subs.onDelivered.delete(h);
  }
  onRead(h: Handler<StompReadReceiptPayload>): () => void {
    this.subs.onRead.add(h);
    return () => this.subs.onRead.delete(h);
  }
  onTyping(h: Handler<StompTypingPayload>): () => void {
    this.subs.onTyping.add(h);
    return () => this.subs.onTyping.delete(h);
  }
  onPresence(h: Handler<PresencePayload>): () => void {
    this.subs.onPresence.add(h);
    return () => this.subs.onPresence.delete(h);
  }
  onSignal(h: Handler<CallSignalPayload>): () => void {
    this.subs.onSignal.add(h);
    return () => this.subs.onSignal.delete(h);
  }
  onConnected(h: () => void): () => void {
    this.subs.onConnected.add(h);
    return () => this.subs.onConnected.delete(h);
  }
  onDisconnected(h: () => void): () => void {
    this.subs.onDisconnected.add(h);
    return () => this.subs.onDisconnected.delete(h);
  }
}

export const stompService = new StompService();
