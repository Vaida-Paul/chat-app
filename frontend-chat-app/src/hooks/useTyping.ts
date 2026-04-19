import { useCallback, useRef } from "react";
import { stompService } from "@/api";

export function useTyping(conversationId: number | null) {
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const sendTyping = useCallback(
    (typing: boolean) => {
      if (conversationId === null) return;
      stompService.sendTyping({ conversationId, typing });
    },
    [conversationId],
  );

  const onInput = useCallback(() => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    sendTyping(true);
    timeoutRef.current = setTimeout(() => {
      sendTyping(false);
      timeoutRef.current = null;
    }, 1500);
  }, [sendTyping]);

  const onStopTyping = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    sendTyping(false);
  }, [sendTyping]);

  return { onInput, onStopTyping };
}
