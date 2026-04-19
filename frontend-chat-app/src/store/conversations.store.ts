import { create } from "zustand";
import type { ConversationDTO, MessageDTO } from "@/types";

interface TypingState {
  [conversationId: number]: boolean;
}

interface ConversationsState {
  conversations: ConversationDTO[];
  activeId: number | null;
  typing: TypingState;

  setConversations: (list: ConversationDTO[]) => void;
  upsertConversation: (conv: ConversationDTO) => void;
  setActiveId: (id: number | null) => void;
  markRead: (conversationId: number) => void;

  /** Called when a new MessageDTO arrives via STOMP /user/queue/messages */
  applyIncomingMessage: (msg: MessageDTO, myUserId: number) => void;

  /** Update DELIVERED status on a sent message */
  applyDelivered: (messageId: number) => void;

  /** Merge presence status from /api/presence/friends */
  applyPresence: (userId: number, online: boolean) => void;

  /** Block / unblock locally (actual API call is separate) */
  setBlocked: (conversationId: number, blocked: boolean) => void;

  setTyping: (conversationId: number, typing: boolean) => void;
}

export const useConversationsStore = create<ConversationsState>()((set) => ({
  conversations: [],
  activeId: null,
  typing: {},

  setConversations(list) {
    set({ conversations: list });
  },

  upsertConversation(conv) {
    set((state) => {
      const idx = state.conversations.findIndex((c) => c.id === conv.id);
      if (idx === -1) return { conversations: [conv, ...state.conversations] };
      const next = [...state.conversations];
      next[idx] = { ...next[idx], ...conv };
      return { conversations: next };
    });
  },

  setActiveId(id) {
    set({ activeId: id });
  },

  markRead(conversationId) {
    set((state) => ({
      conversations: state.conversations.map((c) =>
        c.id === conversationId ? { ...c, unreadCount: 0 } : c,
      ),
    }));
  },

  applyIncomingMessage(msg, myUserId) {
    set((state) => ({
      conversations: state.conversations.map((c) => {
        const isIncoming = c.recipientId === msg.senderId;
        const isOwn =
          msg.senderId === myUserId && (msg as any).conversationId === c.id;

        if (!isIncoming && !isOwn) return c;

        const isActive = state.activeId === c.id;
        return {
          ...c,
          lastMessageContent: msg.content,
          lastMessageTimestamp: msg.createdAt,
          lastMessageSenderId: msg.senderId,
          unreadCount: isActive || isOwn ? 0 : c.unreadCount + 1,
        };
      }),
    }));
  },
  applyDelivered(_messageId) {},

  applyPresence(userId, online) {
    set((state) => ({
      conversations: state.conversations.map((c) =>
        c.recipientId === userId ? { ...c, online } : c,
      ),
    }));
  },

  setBlocked(conversationId, blocked) {
    set((state) => ({
      conversations: state.conversations.map((c) =>
        c.id === conversationId ? { ...c, blocked } : c,
      ),
    }));
  },

  setTyping(conversationId, typing) {
    set((state) => ({
      typing: { ...state.typing, [conversationId]: typing },
    }));
  },
}));
