import React from "react";
import Avatar from "@/components/atoms/Avatar/Avatar";
import IconButton from "@/components/atoms/IconButton/IconButton";
import { CallIcon, BlockIcon, IoIosArrowBack } from "@/components/atoms/Icons";
import type { ConversationDTO } from "@/types";
import styles from "./ChatHeader.module.scss";

interface Props {
  conversation: ConversationDTO;
  isTyping: boolean;
  onBlock: () => void;
  onBack: () => void;
  onCall: () => void;
}

const ChatHeader: React.FC<Props> = ({
  conversation: c,
  isTyping,
  onBlock,
  onBack,
  onCall,
}) => (
  <header className={styles.header}>
    <button className={styles.backBtn} onClick={onBack} title="Back">
      <IoIosArrowBack size={20} />
    </button>
    <Avatar
      name={c.recipientUsername}
      size={40}
      online={c.online ?? false}
      showOnline
      avatarUrl={c.recipientAvatarUrl}
    />
    <div className={styles.info}>
      <span className={styles.name}>{c.recipientUsername}</span>
      <div className={styles.status}>
        <span className={`${styles.dot} ${c.online ? styles.online : ""}`} />
        {isTyping ? (
          <span className={styles.typing}>typing…</span>
        ) : (
          <span>{c.online ? "Online now" : "Offline"}</span>
        )}
        <span className={styles.code}>&nbsp;· {c.recipientInviteCode}</span>
      </div>
    </div>
    <div className={styles.actions}>
      <IconButton title="Video call" onClick={onCall}>
        <CallIcon />
      </IconButton>
      <IconButton
        variant={c.blocked ? "danger" : "default"}
        active={c.blocked}
        title={c.blocked ? "Unblock user" : "Block user"}
        onClick={onBlock}
      >
        <BlockIcon />
      </IconButton>
    </div>
  </header>
);

export default ChatHeader;
