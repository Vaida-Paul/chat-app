import { useCallback, useEffect, useRef } from "react";
import { messagesApi } from "@/api";
import { useAuthStore, useMessagesStore, useConversationsStore } from "@/store";
import { stompService } from "@/api";

const PAGE_SIZE = 20;

export function useMessages(conversationId: number | null) {
  const {
    messages,
    hasMore,
    loading,
    pages,
    setMessages,
    prependMessages,
    setLoading,
  } = useMessagesStore();
  const { markRead } = useConversationsStore();
  const myUserId = useAuthStore((s) => s.user?.id);
  const bottomRef = useRef<HTMLDivElement | null>(null);
  const isLoadingMoreRef = useRef(false);

  const msgs = conversationId != null ? (messages[conversationId] ?? []) : [];
  const isLoading =
    conversationId != null ? (loading[conversationId] ?? false) : false;
  const canLoadMore =
    conversationId != null ? (hasMore[conversationId] ?? false) : false;
  const currentPage = conversationId != null ? (pages[conversationId] ?? 0) : 0;

  useEffect(() => {
    if (conversationId == null) return;
    let cancelled = false;

    (async () => {
      setLoading(conversationId, true);
      try {
        const res = await messagesApi.list(conversationId, 0, PAGE_SIZE);
        if (cancelled) return;

        const ordered = [...res.content].reverse();
        setMessages(conversationId, ordered, !res.last);

        const lastPeerMsg = ordered
          .filter((m) => m.senderId !== myUserId)
          .at(-1);
        if (lastPeerMsg && stompService.connected) {
          stompService.sendRead({
            conversationId,
            lastReadMessageId: lastPeerMsg.id,
          });
          markRead(conversationId);
        } else if (lastPeerMsg) {
          markRead(conversationId);
        }
      } catch (e) {
        console.error("Failed to load messages", e);
      } finally {
        if (!cancelled) setLoading(conversationId, false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [conversationId]);

  useEffect(() => {
    if (msgs.length > 0 && !isLoadingMoreRef.current) {
      bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [msgs.length]);

  const loadMore = useCallback(async () => {
    if (conversationId == null || isLoading || !canLoadMore) return;
    isLoadingMoreRef.current = true;
    setLoading(conversationId, true);
    try {
      const nextPage = currentPage + 1;
      const res = await messagesApi.list(conversationId, nextPage, PAGE_SIZE);
      const ordered = [...res.content].reverse();
      prependMessages(conversationId, ordered, !res.last);
    } catch (e) {
      console.error("Failed to load more messages", e);
    } finally {
      setLoading(conversationId, false);
      setTimeout(() => {
        isLoadingMoreRef.current = false;
      }, 100);
    }
  }, [conversationId, isLoading, canLoadMore, currentPage]);

  return { msgs, isLoading, canLoadMore, loadMore, bottomRef };
}
