import React from "react";
import Avatar from "@/components/atoms/Avatar/Avatar";
import type { ConversationDTO } from "@/types";
import { formatShortTime } from "@/utils/date.utils";
import styles from "./ConversationItem.module.scss";

interface Props {
  conversation: ConversationDTO;
  isActive: boolean;
  myUserId: number;
  index?: number;
  onClick: () => void;
}

const ConversationItem: React.FC<Props> = ({
  conversation: c,
  isActive,
  myUserId,
  index = 0,
  onClick,
}) => {
  const isMine = c.lastMessageSenderId === myUserId;
  const preview =
    c.lastMessageContent == null
      ? c.lastMessageTimestamp
        ? "🚫 Message deleted"
        : "Say hello 👋"
      : isMine
        ? `You: ${c.lastMessageContent}`
        : c.lastMessageContent;

  return (
    <div
      className={`${styles.item} ${isActive ? styles.active : ""} ${c.unreadCount > 0 ? styles.unread : ""}`}
      style={{ animationDelay: `${index * 0.045}s` }}
      onClick={onClick}
    >
      <Avatar
        name={c.recipientUsername}
        size={46}
        online={c.online ?? false}
        showOnline
        avatarUrl={c.recipientAvatarUrl}
      />
      <div className={styles.body}>
        <span className={styles.name}>{c.recipientUsername}</span>
        <span className={styles.preview}>{preview}</span>
      </div>
      <div className={styles.meta}>
        {c.lastMessageTimestamp && (
          <span className={styles.time}>
            {formatShortTime(c.lastMessageTimestamp)}
          </span>
        )}
        {c.unreadCount > 0 && (
          <span className={styles.badge}>{c.unreadCount}</span>
        )}
      </div>
    </div>
  );
};

export default ConversationItem;
