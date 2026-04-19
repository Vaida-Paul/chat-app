import React from "react";
import Avatar from "@/components/atoms/Avatar/Avatar";
import {
  TrashIcon,
  CheckIcon,
  DoubleCheckIcon,
} from "@/components/atoms/Icons";
import type { MessageDTO } from "@/types";
import { formatFullTime } from "@/utils/date.utils";
import styles from "./MessageBubble.module.scss";

interface Props {
  message: MessageDTO;
  isMine: boolean;
  showAvatar: boolean;
  peerName: string;
  avatarUrl?: string;
  onDelete?: (id: number) => void;
}

const MessageBubble: React.FC<Props> = ({
  message: m,
  isMine,
  showAvatar,
  peerName,
  avatarUrl,
  onDelete,
}) => {
  const renderTick = () => {
    if (!isMine || m.deleted) return null;
    if (m.status === "SENT")
      return <CheckIcon className={`${styles.tick} ${styles.sent}`} />;
    if (m.status === "DELIVERED")
      return (
        <DoubleCheckIcon className={`${styles.tick} ${styles.delivered}`} />
      );
    return <DoubleCheckIcon className={`${styles.tick} ${styles.read}`} />;
  };

  const isImage = m.attachmentType === "image";

  return (
    <div className={`${styles.row} ${isMine ? styles.mine : styles.theirs}`}>
      {!isMine && (
        <div
          className={`${styles.miniAvatar} ${showAvatar ? "" : styles.ghost} ${avatarUrl ? styles.hasImage : ""}`}
        >
          {showAvatar && (
            <Avatar name={peerName} size={32} avatarUrl={avatarUrl} />
          )}
        </div>
      )}
      <div className={styles.col}>
        <div className={`${styles.bubble} ${m.deleted ? styles.deleted : ""}`}>
          {!m.deleted && isMine && onDelete && (
            <div className={styles.actions}>
              <button
                className={styles.actionBtn}
                title="Delete message"
                onClick={() => onDelete(m.id)}
              >
                <TrashIcon />
              </button>
            </div>
          )}

          {m.deleted ? (
            "This message was deleted"
          ) : (
            <>
              {m.attachmentUrl && isImage && (
                <img
                  src={m.attachmentUrl}
                  alt="attachment"
                  className={styles.attachmentImage}
                  onClick={() => window.open(m.attachmentUrl, "_blank")}
                />
              )}

              {m.content && (
                <div className={styles.messageText}>{m.content}</div>
              )}
            </>
          )}
        </div>
        <div
          className={styles.footer}
          style={{ flexDirection: isMine ? "row-reverse" : "row" }}
        >
          <span className={styles.time}>{formatFullTime(m.createdAt)}</span>
          {renderTick()}
        </div>
      </div>
    </div>
  );
};

export default MessageBubble;
