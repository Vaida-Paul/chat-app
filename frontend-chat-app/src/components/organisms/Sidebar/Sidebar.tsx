import React, { useState, useEffect, useRef } from "react";
import Avatar from "@/components/atoms/Avatar/Avatar";
import ConversationItem from "@/components/molecules/ConversationItem/ConversationItem";
import IconButton from "@/components/atoms/IconButton/IconButton";
import Spinner from "@/components/atoms/Spinner/Spinner";
import {
  SearchIcon,
  SettingsIcon,
  NewChatIcon,
  XIcon,
} from "@/components/atoms/Icons";
import { useConversations } from "@/hooks/useConversations";
import { useConversationsStore, useAuthStore } from "@/store";
import { conversationsApi, usersApi } from "@/api";
import type { ConversationDTO } from "@/types";
import type { UserDTO } from "@/types";
import styles from "./Sidebar.module.scss";
import logo from "@/assets/logo.png";

interface Props {
  onSettingsOpen: () => void;
}

const Sidebar: React.FC<Props> = ({ onSettingsOpen }) => {
  const [search, setSearch] = useState("");
  const [searchResults, setSearchResults] = useState<UserDTO[] | null>(null);
  const [searching, setSearching] = useState(false);
  const [convPage, setConvPage] = useState(0);
  const [dynamicPageSize, setDynamicPageSize] = useState(6);

  const containerRef = useRef<HTMLDivElement>(null);
  const itemMeasureRef = useRef<HTMLDivElement>(null);

  const { loading } = useConversations();
  const { conversations, activeId, setActiveId, upsertConversation } =
    useConversationsStore();
  const myId = useAuthStore((s) => s.user?.id ?? 0);

  const sorted = [...conversations].sort((a, b) => {
    const aU = a.unreadCount > 0 ? 1 : 0;
    const bU = b.unreadCount > 0 ? 1 : 0;
    if (aU !== bU) return bU - aU;
    const ta = a.lastMessageTimestamp
      ? new Date(a.lastMessageTimestamp).getTime()
      : 0;
    const tb = b.lastMessageTimestamp
      ? new Date(b.lastMessageTimestamp).getTime()
      : 0;
    return tb - ta;
  });

  useEffect(() => {
    const calculatePageSize = () => {
      if (!containerRef.current || !itemMeasureRef.current) return;
      const containerHeight = containerRef.current.clientHeight;

      const itemHeight = itemMeasureRef.current.offsetHeight;
      if (itemHeight === 0) return;

      const possible = Math.floor(containerHeight / itemHeight);

      const newSize = Math.min(20, Math.max(3, possible));
      setDynamicPageSize(newSize);
    };

    const timeout = setTimeout(calculatePageSize, 50);
    window.addEventListener("resize", calculatePageSize);
    return () => {
      clearTimeout(timeout);
      window.removeEventListener("resize", calculatePageSize);
    };
  }, [sorted.length]);

  const totalPages = Math.ceil(sorted.length / dynamicPageSize);
  const visible = sorted.slice(
    convPage * dynamicPageSize,
    (convPage + 1) * dynamicPageSize,
  );

  useEffect(() => {
    setConvPage(0);
  }, [dynamicPageSize]);

  const handleSearchChange = async (q: string) => {
    setSearch(q);
    const trimmed = q.trim();
    if (!trimmed) {
      setSearchResults(null);
      return;
    }
    setSearching(true);
    try {
      const res = await usersApi.search(trimmed);
      setSearchResults(res);
    } catch {
      setSearchResults([]);
    } finally {
      setSearching(false);
    }
  };

  const clearSearch = () => {
    setSearch("");
    setSearchResults(null);
  };

  const openConversation = async (recipientId: number) => {
    clearSearch();
    try {
      const conv = await conversationsApi.create({ recipientId });
      upsertConversation(conv);
      setActiveId(conv.id);
    } catch (e) {
      console.error("Failed to open conversation", e);
    }
  };

  const dummyConversation: ConversationDTO = {
    id: -1,
    recipientId: -1,
    recipientUsername: "Measure",
    recipientInviteCode: "000000",
    lastMessageContent: null,
    lastMessageTimestamp: null,
    lastMessageSenderId: null,
    unreadCount: 0,
    online: false,
    blocked: false,
  };

  return (
    <aside className={styles.sidebar}>
      <div className={styles.header}>
        <div className={styles.brand}>
          <div className={styles.logo}>
            <img src={logo} alt="Logo" />
          </div>
          <span className={styles.brandName}>Echo</span>
        </div>
        <div className={styles.headerActions}>
          <IconButton title="Settings" onClick={onSettingsOpen}>
            <SettingsIcon />
          </IconButton>
        </div>
      </div>

      <div className={styles.searchWrap}>
        <div className={styles.searchBox}>
          <SearchIcon size={14} />
          <input
            className={styles.searchInput}
            placeholder="Search by email or #code…"
            value={search}
            onChange={(e) => handleSearchChange(e.target.value)}
          />
          {search && (
            <button
              className={styles.clearBtn}
              onClick={clearSearch}
              type="button"
            >
              <XIcon size={12} />
            </button>
          )}
        </div>

        {(searchResults !== null || searching) && (
          <>
            <div className={styles.searchOverlay} onClick={clearSearch} />
            <div className={styles.searchDrop}>
              {searching && (
                <div className={styles.searchLoading}>
                  <Spinner size={18} />
                </div>
              )}
              {!searching && searchResults?.length === 0 && (
                <div className={styles.searchEmpty}>No users found</div>
              )}
              {!searching &&
                searchResults?.map((u) => (
                  <div
                    key={u.id}
                    className={styles.searchResult}
                    onClick={() => openConversation(u.id)}
                  >
                    <Avatar
                      name={u.username}
                      size={34}
                      avatarUrl={u.avatarUrl}
                    />
                    <div className={styles.resultText}>
                      <div className={styles.resultName}>{u.username}</div>
                      <div className={styles.resultSub}>
                        {u.code && <span>{u.code} · </span>}
                        {u.email}
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          </>
        )}
      </div>

      <span className={styles.sectionLabel}>Messages</span>

      <div className={styles.convList} ref={containerRef}>
        <div
          ref={itemMeasureRef}
          style={{
            visibility: "hidden",
            position: "absolute",
            height: "auto",
            width: "100%",
            pointerEvents: "none",
          }}
        >
          <ConversationItem
            conversation={dummyConversation}
            isActive={false}
            myUserId={myId}
            index={0}
            onClick={() => {}}
          />
        </div>

        {loading && conversations.length === 0 && (
          <div className={styles.listLoading}>
            <Spinner />
          </div>
        )}
        {!loading && conversations.length === 0 && (
          <div className={styles.emptyList}>
            No conversations yet.
            <br />
            Search for someone to start chatting.
          </div>
        )}
        {visible.map((c, i) => (
          <ConversationItem
            key={c.id}
            conversation={c}
            isActive={c.id === activeId}
            myUserId={myId}
            index={i}
            onClick={() => setActiveId(c.id)}
          />
        ))}
      </div>

      {totalPages > 1 && (
        <div className={styles.pager}>
          <button
            className={styles.pgBtn}
            disabled={convPage === 0}
            onClick={() => setConvPage((p) => p - 1)}
          >
            ‹
          </button>
          {Array.from({ length: totalPages }, (_, i) => (
            <button
              key={i}
              className={`${styles.pgBtn} ${convPage === i ? styles.pgActive : ""}`}
              onClick={() => setConvPage(i)}
            >
              {i + 1}
            </button>
          ))}
          <button
            className={styles.pgBtn}
            disabled={convPage >= totalPages - 1}
            onClick={() => setConvPage((p) => p + 1)}
          >
            ›
          </button>
        </div>
      )}
    </aside>
  );
};

export default Sidebar;
