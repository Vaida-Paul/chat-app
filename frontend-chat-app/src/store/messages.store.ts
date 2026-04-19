import { create } from "zustand";
import type { MessageDTO, MessageStatus } from "@/types";

interface MessagesState {
  messages: Record<number, MessageDTO[]>;
  pages: Record<number, number>;
  hasMore: Record<number, boolean>;
  loading: Record<number, boolean>;

  setMessages: (convId: number, msgs: MessageDTO[], hasMore: boolean) => void;
  prependMessages: (
    convId: number,
    msgs: MessageDTO[],
    hasMore: boolean,
  ) => void;
  appendMessage: (msg: MessageDTO) => void;
  updateMessageStatus: (messageId: number, status: MessageStatus) => void;
  markMessageDeleted: (messageId: number, convId: number) => void;
  setLoading: (convId: number, loading: boolean) => void;
}

export const useMessagesStore = create<MessagesState>()((set) => ({
  messages: {},
  pages: {},
  hasMore: {},
  loading: {},

  setMessages(convId, msgs, hasMore) {
    set((s) => ({
      messages: { ...s.messages, [convId]: msgs },
      pages: { ...s.pages, [convId]: 0 },
      hasMore: { ...s.hasMore, [convId]: hasMore },
    }));
  },

  prependMessages(convId, msgs, hasMore) {
    set((s) => ({
      messages: {
        ...s.messages,
        [convId]: [...msgs, ...(s.messages[convId] ?? [])],
      },
      pages: { ...s.pages, [convId]: (s.pages[convId] ?? 0) + 1 },
      hasMore: { ...s.hasMore, [convId]: hasMore },
    }));
  },

  appendMessage(msg) {
    set((s) => {
      const convId = msg.id;

      return s;
    });
  },

  setLoading(convId, loading) {
    set((s) => ({ loading: { ...s.loading, [convId]: loading } }));
  },

  updateMessageStatus(messageId, status) {
    set((s) => {
      const updated: Record<number, MessageDTO[]> = {};
      for (const [key, msgs] of Object.entries(s.messages)) {
        updated[Number(key)] = msgs.map((m) =>
          m.id === messageId ? { ...m, status } : m,
        );
      }
      return { messages: updated };
    });
  },

  markMessageDeleted(messageId, convId) {
    set((s) => ({
      messages: {
        ...s.messages,
        [convId]: (s.messages[convId] ?? []).map((m) =>
          m.id === messageId ? { ...m, deleted: true, content: null } : m,
        ),
      },
    }));
  },
  replaceOptimistic: (oldId: number, newMsg: MessageDTO) => {
    set((state) => {
      const convId = newMsg.conversationId;
      const current = state.messages[convId] || [];
      const index = current.findIndex((m) => m.id === oldId);
      if (index === -1) return state;
      const updated = [...current];
      updated[index] = newMsg;
      return {
        messages: { ...state.messages, [convId]: updated },
      };
    });
  },
}));

export function appendMessageToConv(convId: number, msg: MessageDTO): void {
  useMessagesStore.setState((s) => {
    const existing = s.messages[convId] ?? [];
    if (existing.some((m) => m.id === msg.id)) return s;
    return {
      messages: { ...s.messages, [convId]: [...existing, msg] },
    };
  });
}
