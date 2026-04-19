import { useEffect, useState } from "react";
import { stompService } from "@/api";
import {
  useAuthStore,
  useConversationsStore,
  useMessagesStore,
  useUIStore,
} from "@/store";
import { appendMessageToConv } from "@/store/messages.store";
import type {
  MessageDTO,
  StompDeliveryReceiptPayload,
  StompReadReceiptPayload,
  StompTypingPayload,
} from "@/types";

export function useWebSocket() {
  const token = useAuthStore((s) => s.token);
  const myUserId = useAuthStore((s) => s.user?.id);
  const activeId = useConversationsStore((s) => s.activeId);
  const { applyIncomingMessage, setTyping, applyPresence } =
    useConversationsStore();
  const { updateMessageStatus } = useMessagesStore();
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    if (!token || !myUserId) return;

    const offConn = stompService.onConnected(() => setConnected(true));
    const offDisc = stompService.onDisconnected(() => setConnected(false));

    stompService.connect(token);
    if (stompService.connected) setConnected(true);

    const unsubMsg = stompService.onMessage((msg: MessageDTO) => {
      const conversations = useConversationsStore.getState().conversations;
      const conv = conversations.find(
        (c) => c.id === msg.conversationId || c.recipientId === msg.senderId,
      );

      if (!conv) {
        console.warn("[MSG] no matching conversation found for msg:", msg);
        return;
      }

      if (msg.senderId === myUserId) {
        useMessagesStore.setState((s) => {
          const existing = s.messages[conv.id] ?? [];
          const optimisticIndex = existing.findIndex(
            (m) => m.id < 0 && m.attachmentUrl === msg.attachmentUrl,
          );
          if (optimisticIndex !== -1) {
            const updated = [...existing];
            updated[optimisticIndex] = msg;
            return { messages: { ...s.messages, [conv.id]: updated } };
          }
          const filtered = existing.filter((m) => m.id >= 0);
          if (filtered.some((m) => m.id === msg.id)) return s;
          return { messages: { ...s.messages, [conv.id]: [...filtered, msg] } };
        });
      } else {
        appendMessageToConv(conv.id, msg);
        stompService.sendDelivered({ messageId: msg.id });

        const { notificationsEnabled } = useUIStore.getState();
        if (notificationsEnabled && Notification.permission === "granted") {
          try {
            new Notification(msg.senderUsername, {
              body: msg.content || "📎 Sent an image",
              icon: "/icons/icon-192x192.png",
              tag: `msg-${msg.conversationId}`,
              silent: false,
            });
          } catch (e) {
            console.warn("[NOTIF] failed:", e);
          }
        }
        const currentActiveId = useConversationsStore.getState().activeId;
        if (currentActiveId === conv.id) {
          stompService.sendRead({
            conversationId: conv.id,
            lastReadMessageId: msg.id,
          });
          useConversationsStore.getState().markRead(conv.id);
        }
      }

      applyIncomingMessage(msg, myUserId);
    });

    const unsubDelivered = stompService.onDelivered(
      (payload: StompDeliveryReceiptPayload) => {
        updateMessageStatus(payload.messageId, "DELIVERED");
      },
    );

    const unsubRead = stompService.onRead(
      (payload: StompReadReceiptPayload) => {
        const convId = Number(payload.conversationId);
        useMessagesStore.setState((s) => {
          const msgs = s.messages[convId] ?? [];
          const updated = msgs.map((m) =>
            m.senderId === myUserId &&
            m.id <= payload.lastReadMessageId &&
            m.status !== "READ"
              ? { ...m, status: "READ" as const }
              : m,
          );
          return { messages: { ...s.messages, [convId]: updated } };
        });
      },
    );

    const unsubTyping = stompService.onTyping((payload: StompTypingPayload) => {
      setTyping(payload.conversationId, payload.typing);
    });

    const unsubPresence = stompService.onPresence((payload) => {
      applyPresence(payload.userId, payload.online);
    });

    return () => {
      offConn();
      offDisc();
      unsubMsg();
      unsubDelivered();
      unsubRead();
      unsubTyping();
      unsubPresence();
    };
  }, [token, myUserId]);

  useEffect(() => {
    if (!activeId || !myUserId) return;
    if (!stompService.connected) return;

    const msgs = useMessagesStore.getState().messages[activeId] ?? [];
    const lastPeerMsg = [...msgs]
      .reverse()
      .find((m) => m.senderId !== myUserId);
    if (!lastPeerMsg) return;

    stompService.sendRead({
      conversationId: activeId,
      lastReadMessageId: lastPeerMsg.id,
    });
    useConversationsStore.getState().markRead(activeId);
  }, [activeId, myUserId]);

  return { connected };
}
