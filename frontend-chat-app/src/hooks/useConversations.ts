import { useCallback, useEffect, useState } from "react";
import { conversationsApi, presenceApi } from "@/api";
import { useConversationsStore } from "@/store";

export function useConversations() {
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { setConversations, applyPresence } = useConversationsStore();

  const fetchPage = useCallback(
    async (p: number) => {
      setLoading(true);
      setError(null);
      try {
        const res = await conversationsApi.list(p, 20);
        setConversations(res.content);
        setTotalPages(res.totalPages);
        setPage(p);

        try {
          const presences = await presenceApi.getFriends();
          presences.forEach((ps) => applyPresence(ps.userId, ps.online));
        } catch {}
      } catch {
        setError("Failed to load conversations");
      } finally {
        setLoading(false);
      }
    },
    [setConversations, applyPresence],
  );

  useEffect(() => {
    fetchPage(0);
  }, []);

  return {
    page,
    totalPages,
    loading,
    error,
    goToPage: fetchPage,
    refresh: () => fetchPage(page),
  };
}
