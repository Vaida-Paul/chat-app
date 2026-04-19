import React, { useState } from "react";
import Sidebar from "@/components/organisms/Sidebar/Sidebar";
import ChatHeader from "@/components/organisms/ChatHeader/ChatHeader";
import MessageList, {
  TypingIndicator,
} from "@/components/organisms/MessageList/MessageList";
import MessageInput from "@/components/organisms/MessageInput/MessageInput";
import SettingsDrawer from "@/components/organisms/SettingsDrawer/SettingsDrawer";
import Modal from "@/components/molecules/Modal/Modal";
import ToastContainer from "@/components/molecules/Toast/Toast";
import Spinner from "@/components/atoms/Spinner/Spinner";
import { useAuthStore, useConversationsStore } from "@/store";
import { useMessages } from "@/hooks/useMessages";
import { useWebSocket } from "@/hooks/useWebSocket";
import { useToast } from "@/hooks/useToast";
import { blockApi, stompService } from "@/api";
import { appendMessageToConv } from "@/store/messages.store";
import styles from "./ChatPage.module.scss";
import logo from "@/assets/logo.png";
import { useCall } from "@/hooks/useCall";
import CallOverlay from "@/components/organisms/CallOverllay/CallOverllay";
import { MessageDTO } from "@/types";

const EmptyState: React.FC = () => (
  <div className={styles.emptyState}>
    <div className={styles.emptyIcon}>
      <img src={logo} alt="Logo" />
    </div>
    <h2 className={styles.emptyTitle}>Your messages</h2>
    <p className={styles.emptySub}>
      Select a conversation from the left, or search for someone to get started.
    </p>
  </div>
);

const ChatPane: React.FC<{
  conversationId: number;
  connected: boolean;
  onBack: () => void;
  showToast: (msg: string, type?: "success" | "error") => void;
}> = ({ conversationId, connected, onBack, showToast }) => {
  const [blockModal, setBlockModal] = useState(false);
  const { user } = useAuthStore();
  const { conversations, setBlocked, typing } = useConversationsStore();

  const conv = conversations.find((c) => c.id === conversationId);
  const { msgs, isLoading, canLoadMore, loadMore, bottomRef } =
    useMessages(conversationId);

  const {
    callState,
    localStream,
    remoteStream,
    incomingCall,
    startCall,
    acceptCall,
    rejectCall,
    endCall,
    isMuted,
    isVideoOff,
    toggleMute,
    toggleVideo,
    duration,
    connectionQuality,
    isSharingScreen,
    toggleScreenShare,
  } = useCall();

  const isTyping = typing[conversationId] ?? false;

  if (!conv || !user)
    return (
      <div className={styles.loadingPane}>
        <Spinner />
      </div>
    );
  const handleSend = (
    text: string,
    attachmentUrl?: string,
    attachmentType?: string,
  ) => {
    stompService.sendMessage({
      conversationId,
      content: text || "",
      attachmentUrl,
      attachmentType,
    });

    const tempId = -Date.now();
    const tempMsg: MessageDTO = {
      id: tempId,
      content: text || null,
      senderId: user.id,
      senderUsername: user.username,
      senderAvatarUrl: user.avatarUrl,
      createdAt: new Date().toISOString(),
      deleted: false,
      status: "SENT",
      conversationId,
      attachmentUrl,
      attachmentType,
    };
    appendMessageToConv(conversationId, tempMsg);
  };

  const handleDeleteMessage = async (messageId: number) => {
    try {
      const { messagesApi } = await import("@/api");
      await messagesApi.delete(conversationId, messageId);
      const { useMessagesStore } = await import("@/store");
      useMessagesStore.getState().markMessageDeleted(messageId, conversationId);
      showToast("Message deleted");
    } catch {
      showToast("Failed to delete message", "error");
    }
  };

  const handleBlock = async () => {
    try {
      if (conv.blocked) {
        await blockApi.unblock(conv.recipientId);
        setBlocked(conversationId, false);
        showToast(`${conv.recipientUsername} unblocked`);
      } else {
        await blockApi.block(conv.recipientId);
        setBlocked(conversationId, true);
        showToast(`${conv.recipientUsername} blocked`);
      }
    } catch {
      showToast("Action failed", "error");
    } finally {
      setBlockModal(false);
    }
  };

  return (
    <>
      <CallOverlay
        callState={callState}
        peerName={conv.recipientUsername}
        localStream={localStream}
        remoteStream={remoteStream}
        isMuted={isMuted}
        isVideoOff={isVideoOff}
        onAccept={acceptCall}
        onReject={rejectCall}
        onEnd={endCall}
        onToggleMute={toggleMute}
        onToggleVideo={toggleVideo}
        duration={duration}
        connectionQuality={connectionQuality}
        isSharingScreen={isSharingScreen}
        onToggleScreenShare={toggleScreenShare}
        peerAvatarUrl={conv.recipientAvatarUrl}
      />

      <ChatHeader
        conversation={conv}
        isTyping={isTyping}
        onBlock={() => setBlockModal(true)}
        onBack={onBack}
        onCall={() => startCall(conversationId)}
      />

      <MessageList
        conversationId={conversationId}
        peerName={conv.recipientUsername}
        myId={user.id}
        myAvatarUrl={user.avatarUrl}
        recipientAvatarUrl={conv.recipientAvatarUrl}
        msgs={msgs}
        isLoading={isLoading}
        canLoadMore={canLoadMore}
        onLoadMore={loadMore}
        onDeleteMessage={handleDeleteMessage}
        bottomRef={bottomRef}
      />

      {isTyping && (
        <div className={styles.typingWrap}>
          <TypingIndicator name={conv.recipientUsername.split(" ")[0]} />
        </div>
      )}

      {conv.blocked && (
        <div className={styles.blockedBar}>
          🚫 You&rsquo;ve blocked {conv.recipientUsername}.{" "}
          <button
            className={styles.unblockBtn}
            onClick={() => setBlockModal(true)}
          >
            Unblock
          </button>
        </div>
      )}

      {!conv.blocked && (
        <MessageInput
          conversationId={conversationId}
          onSend={handleSend}
          disabled={!connected}
        />
      )}

      {blockModal && (
        <Modal
          title={`${conv.blocked ? "Unblock" : "Block"} ${conv.recipientUsername}?`}
          description={
            conv.blocked
              ? `${conv.recipientUsername} will be able to message you again.`
              : `${conv.recipientUsername} won't be able to send you messages.`
          }
          confirmLabel={conv.blocked ? "Unblock" : "Block User"}
          confirmVariant={conv.blocked ? "primary" : "danger"}
          onConfirm={handleBlock}
          onCancel={() => setBlockModal(false)}
        />
      )}
    </>
  );
};

const ChatPage: React.FC = () => {
  const [settingsOpen, setSettingsOpen] = useState(false);
  const { toasts, showToast } = useToast();
  const { activeId, setActiveId } = useConversationsStore();
  const { connected } = useWebSocket();

  const handleBack = () => setActiveId(null);

  return (
    <div className={styles.layout}>
      <div
        className={`${styles.sidebarWrap} ${activeId != null ? styles.sidebarHidden : ""}`}
      >
        <Sidebar onSettingsOpen={() => setSettingsOpen(true)} />
      </div>

      <main
        className={`${styles.main} ${activeId != null ? styles.mainVisible : ""}`}
      >
        {activeId == null ? (
          <EmptyState />
        ) : (
          <div className={styles.chatSlide} key={activeId}>
            <ChatPane
              conversationId={activeId}
              connected={connected}
              onBack={handleBack}
              showToast={showToast}
            />
          </div>
        )}
      </main>

      <SettingsDrawer
        open={settingsOpen}
        onClose={() => setSettingsOpen(false)}
      />
      <ToastContainer toasts={toasts} />
    </div>
  );
};

export default ChatPage;
