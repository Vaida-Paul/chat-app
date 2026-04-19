import React, { useRef, useCallback, useLayoutEffect } from "react";
import MessageBubble from "@/components/molecules/MessageBubble/MessageBubble";
import Spinner from "@/components/atoms/Spinner/Spinner";
import type { MessageDTO } from "@/types";
import { formatDateDivider, isSameDay } from "@/utils/date.utils";
import styles from "./MessageList.module.scss";

interface Props {
  conversationId: number;
  peerName: string;
  myId: number;
  myAvatarUrl?: string;
  recipientAvatarUrl?: string;
  msgs: MessageDTO[];
  isLoading: boolean;
  canLoadMore: boolean;
  onLoadMore: () => void;
  onDeleteMessage: (messageId: number) => void;
  bottomRef: React.RefObject<HTMLDivElement>;
}

declare global {
  interface Window {
    __loadMoreInProgress?: boolean;
  }
}

export const TypingIndicator: React.FC<{ name: string }> = ({ name }) => (
  <div className={styles.typingRow}>
    <div className={styles.typingBubble}>
      <span className={styles.td} />
      <span className={styles.td} />
      <span className={styles.td} />
    </div>
    <span className={styles.typingLabel}>{name} is typing…</span>
  </div>
);

const MessageList: React.FC<Props> = ({
  peerName,
  myId,
  myAvatarUrl,
  recipientAvatarUrl,
  msgs,
  isLoading,
  canLoadMore,
  onLoadMore,
  onDeleteMessage,
  bottomRef,
}) => {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const loadMoreInProgress = useRef(false);
  const prevScrollHeight = useRef(0);
  const prevScrollTop = useRef(0);

  const handleLoadMore = useCallback(() => {
    if (!scrollContainerRef.current || loadMoreInProgress.current) return;
    loadMoreInProgress.current = true;
    window.__loadMoreInProgress = true;
    prevScrollHeight.current = scrollContainerRef.current.scrollHeight;
    prevScrollTop.current = scrollContainerRef.current.scrollTop;
    onLoadMore();
  }, [onLoadMore]);

  useLayoutEffect(() => {
    if (loadMoreInProgress.current && scrollContainerRef.current) {
      const newScrollHeight = scrollContainerRef.current.scrollHeight;
      const addedHeight = newScrollHeight - prevScrollHeight.current;
      if (addedHeight > 0) {
        scrollContainerRef.current.scrollTop =
          prevScrollTop.current + addedHeight;
      }
      setTimeout(() => {
        loadMoreInProgress.current = false;
        window.__loadMoreInProgress = false;
      }, 100);
      prevScrollHeight.current = 0;
      prevScrollTop.current = 0;
    }
  }, [msgs]);

  return (
    <div className={styles.list} ref={scrollContainerRef}>
      {canLoadMore && (
        <button
          className={styles.loadMore}
          onClick={handleLoadMore}
          disabled={isLoading}
        >
          {isLoading ? <Spinner size={14} /> : "↑ Load earlier messages"}
        </button>
      )}

      {msgs.map((m, i) => {
        const prev = msgs[i - 1];
        const showDivider = !prev || !isSameDay(prev.createdAt, m.createdAt);
        const isMine = m.senderId === myId;
        const next = msgs[i + 1];
        const showAvatar = !isMine && (!next || next.senderId !== m.senderId);
        const avatarUrl = isMine ? myAvatarUrl : recipientAvatarUrl;

        return (
          <React.Fragment key={m.id}>
            {showDivider && (
              <div className={styles.dateDivider}>
                <span>{formatDateDivider(m.createdAt)}</span>
              </div>
            )}
            <MessageBubble
              message={m}
              isMine={isMine}
              showAvatar={showAvatar}
              peerName={peerName}
              avatarUrl={avatarUrl}
              onDelete={isMine ? onDeleteMessage : undefined}
            />
          </React.Fragment>
        );
      })}

      <div ref={bottomRef} />
    </div>
  );
};

export default MessageList;
