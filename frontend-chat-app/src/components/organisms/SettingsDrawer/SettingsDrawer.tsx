import React, { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import Avatar from "@/components/atoms/Avatar/Avatar";
import Spinner from "@/components/atoms/Spinner/Spinner";
import {
  XIcon,
  CopyIcon,
  CheckIcon,
  EditIcon,
  BellIcon,
  ShieldIcon,
  InfoIcon,
} from "@/components/atoms/Icons";
import { THEMES } from "@/styles/themes";
import { useAuthStore, useConversationsStore, useUIStore } from "@/store";
import type { ThemeKey } from "@/types";
import { FiLogOut, FiCamera, FiTrash2, FiType } from "react-icons/fi";
import { IoPersonSharp } from "react-icons/io5";
import { RiQrCodeFill } from "react-icons/ri";
import { MdEmail } from "react-icons/md";
import styles from "./SettingsDrawer.module.scss";
import { FontFamily } from "@/store/ui.store";

interface Props {
  open: boolean;
  onClose: () => void;
}

const SettingsDrawer: React.FC<Props> = ({ open, onClose }) => {
  const navigate = useNavigate();
  const { user, updateUser, logout } = useAuthStore();
  const { conversations } = useConversationsStore();
  const {
    theme,
    setTheme,
    notificationsEnabled,
    setNotificationsEnabled,
    fontFamily,
    setFontFamily,
  } = useUIStore();

  const [editingName, setEditingName] = useState(false);
  const [nameValue, setNameValue] = useState("");
  const [savingName, setSavingName] = useState(false);
  const [copied, setCopied] = useState(false);
  const [nameError, setNameError] = useState("");
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [avatarError, setAvatarError] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!open || !user) return null;

  const totalMessages = conversations.reduce(
    (sum, c) => sum + (c.lastMessageTimestamp ? 1 : 0),
    0,
  );
  const onlineCount = conversations.filter((c) => c.online).length;

  const handleSaveName = async () => {
    const trimmed = nameValue.trim();
    if (!trimmed) return;
    setSavingName(true);
    setNameError("");
    try {
      const { usersApi } = await import("@/api");
      const updated = await usersApi.updateProfile({ username: trimmed });
      updateUser(updated);
      setEditingName(false);
    } catch {
      setNameError("Failed to update name.");
    } finally {
      setSavingName(false);
    }
  };

  const handleCopyCode = () => {
    if (!user.code) return;
    navigator.clipboard.writeText(user.code).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  };

  const handleLogout = () => {
    logout();
    onClose();
    navigate("/auth");
  };

  const handleAvatarClick = () => fileInputRef.current?.click();

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingAvatar(true);
    setAvatarError("");
    try {
      const { usersApi } = await import("@/api");
      const updated = await usersApi.uploadAvatar(file);
      updateUser(updated);
    } catch {
      setAvatarError("Failed to upload. Max 5MB, images only.");
    } finally {
      setUploadingAvatar(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };
  const handleToggleNotifications = async () => {
    if (!notificationsEnabled) {
      if ("Notification" in window) {
        const permission = await Notification.requestPermission();
        if (permission === "granted") {
          setNotificationsEnabled(true);
        } else {
          alert(
            "Notifications blocked. Please allow them in browser settings.",
          );
        }
      } else {
        alert("Notifications not supported in this browser");
      }
    } else {
      setNotificationsEnabled(false);
    }
  };

  const handleRemoveAvatar = async () => {
    setUploadingAvatar(true);
    setAvatarError("");
    try {
      const { usersApi } = await import("@/api");
      const updated = await usersApi.removeAvatar();
      updateUser(updated);
    } catch {
      setAvatarError("Failed to remove photo.");
    } finally {
      setUploadingAvatar(false);
    }
  };

  return (
    <>
      <div className={styles.overlay} onClick={onClose} />
      <aside className={styles.drawer}>
        <div className={styles.header}>
          <span className={styles.title}>Settings</span>
          <button className={styles.closeBtn} onClick={onClose}>
            <XIcon size={14} />
          </button>
        </div>

        <div className={styles.body}>
          <section className={styles.section}>
            <h3 className={styles.sectionTitle}>Profile</h3>

            <div className={styles.avatarCard}>
              <div className={styles.avatarUploadWrap}>
                <Avatar
                  name={user.username}
                  size={80}
                  avatarUrl={user.avatarUrl}
                />
                <button
                  className={styles.avatarOverlay}
                  onClick={handleAvatarClick}
                  disabled={uploadingAvatar}
                  title="Change photo"
                >
                  {uploadingAvatar ? (
                    <Spinner size={18} />
                  ) : (
                    <FiCamera size={18} />
                  )}
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className={styles.fileInput}
                  onChange={handleAvatarChange}
                />
              </div>

              <div className={styles.avatarInfo}>
                <p className={styles.avatarName}>{user.username}</p>

                <div className={styles.avatarActions}>
                  <button
                    className={styles.changePhotoBtn}
                    onClick={handleAvatarClick}
                    disabled={uploadingAvatar}
                  >
                    <FiCamera size={11} />
                    {user.avatarUrl ? "Change photo" : "Upload photo"}
                  </button>
                  {user.avatarUrl && (
                    <button
                      className={styles.removePhotoBtn}
                      onClick={handleRemoveAvatar}
                      disabled={uploadingAvatar}
                    >
                      <FiTrash2 size={11} />
                      Remove
                    </button>
                  )}
                </div>
                {avatarError && (
                  <p className={styles.avatarError}>{avatarError}</p>
                )}
              </div>
            </div>

            <div className={styles.card}>
              <div className={styles.cardRow}>
                <span className={styles.rowIcon}>
                  <IoPersonSharp />
                </span>
                <div className={styles.rowContent}>
                  <div className={styles.rowLabel}>Display Name</div>
                  <div className={styles.rowSub}>{user.username}</div>
                  {editingName ? (
                    <>
                      <div className={styles.editRow}>
                        <input
                          className={styles.editInput}
                          value={nameValue}
                          onChange={(e) => setNameValue(e.target.value)}
                          onKeyDown={(e) =>
                            e.key === "Enter" && handleSaveName()
                          }
                          placeholder="New username…"
                          autoFocus
                        />
                        <button
                          className={styles.saveBtn}
                          onClick={handleSaveName}
                          disabled={savingName}
                        >
                          {savingName ? <Spinner size={14} /> : "Save"}
                        </button>
                        <button
                          className={styles.cancelBtn}
                          onClick={() => {
                            setEditingName(false);
                            setNameError("");
                          }}
                        >
                          <XIcon size={12} />
                        </button>
                      </div>
                      {nameError && (
                        <div className={styles.fieldError}>{nameError}</div>
                      )}
                    </>
                  ) : (
                    <button
                      className={styles.editTrigger}
                      onClick={() => {
                        setEditingName(true);
                        setNameValue(user.username);
                      }}
                    >
                      <EditIcon size={11} /> Edit name
                    </button>
                  )}
                </div>
              </div>

              {user.code && (
                <div className={styles.cardRow}>
                  <span className={styles.rowIcon}>
                    <RiQrCodeFill />
                  </span>
                  <div className={styles.rowContent}>
                    <div className={styles.rowLabel}>Invite Code</div>
                    <div className={styles.rowSub}>
                      Share so others can find you
                    </div>
                    <div className={styles.codeBox}>
                      <span className={styles.codeValue}>{user.code}</span>
                      <button
                        className={styles.copyBtn}
                        onClick={handleCopyCode}
                      >
                        {copied ? (
                          <>
                            <CheckIcon size={11} /> Copied!
                          </>
                        ) : (
                          <>
                            <CopyIcon size={11} /> Copy
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              )}

              <div className={styles.cardRow}>
                <span className={styles.rowIcon}>
                  <MdEmail />
                </span>
                <div>
                  <div className={styles.rowLabel}>Email</div>
                  <div className={styles.rowSub}>{user.email}</div>
                </div>
              </div>
            </div>
          </section>

          <section className={styles.section}>
            <h3 className={styles.sectionTitle}>Activity</h3>
            <div className={styles.statsRow}>
              <div className={styles.statPill}>
                <span className={styles.statNum}>{conversations.length}</span>
                <span className={styles.statLabel}>Chats</span>
              </div>
              <div className={styles.statPill}>
                <span className={styles.statNum}>{totalMessages}</span>
                <span className={styles.statLabel}>Messages</span>
              </div>
              <div className={styles.statPill}>
                <span className={styles.statNum}>{onlineCount}</span>
                <span className={styles.statLabel}>Online</span>
              </div>
            </div>
          </section>

          <section className={styles.section}>
            <h3 className={styles.sectionTitle}>Appearance — Choose a theme</h3>
            <div className={styles.themeGrid}>
              {(
                Object.entries(THEMES) as [
                  ThemeKey,
                  (typeof THEMES)[ThemeKey],
                ][]
              ).map(([key, t]) => (
                <button
                  key={key}
                  className={`${styles.themeCard} ${theme === key ? styles.themeActive : ""}`}
                  onClick={() => setTheme(key)}
                  type="button"
                >
                  <div className={styles.themeIconWrapper}>
                    <img
                      src={t.icon}
                      alt={t.name}
                      className={styles.themeIcon}
                    />
                  </div>
                  <span className={styles.themeName}>{t.name}</span>
                </button>
              ))}
            </div>
          </section>

          <section className={styles.section}>
            <h3 className={styles.sectionTitle}>Preferences</h3>
            <div className={styles.card}>
              <div className={styles.cardRow}>
                <span
                  className={styles.rowIcon}
                  style={{ color: "var(--accent)" }}
                >
                  <BellIcon size={15} />
                </span>
                <div style={{ flex: 1 }}>
                  <div className={styles.rowLabel}>Notifications</div>
                  <div className={styles.rowSub}>Sound & push alerts</div>
                </div>
                <div className={styles.toggleSwitch}>
                  <input
                    type="checkbox"
                    id="notif-toggle"
                    checked={notificationsEnabled}
                    onChange={handleToggleNotifications}
                  />
                  <label
                    htmlFor="notif-toggle"
                    className={styles.toggleSlider}
                  />
                </div>
              </div>

              <div className={styles.cardRow}>
                <span
                  className={styles.rowIcon}
                  style={{ color: "var(--accent)" }}
                >
                  <FiType size={15} />
                </span>
                <div style={{ flex: 1 }}>
                  <div className={styles.rowLabel}>Chat Font</div>
                </div>
                <select
                  className={styles.select}
                  value={fontFamily}
                  onChange={(e) => setFontFamily(e.target.value as FontFamily)}
                >
                  <option value="system">System Default</option>
                  <option value="quicksand">Quicksand</option>
                  <option value="pacifico">Pacifico</option>
                  <option value="caveat">Caveat</option>
                  <option value="amatic">Amatic</option>
                  <option value="orbitron">Orbitron</option>
                  <option value="spacemono">Space Mono</option>
                  <option value="syne">Syne</option>
                  <option value="fraunces">Fraunces</option>
                  <option value="bebas">Bebas Neue</option>
                </select>
              </div>

              <div className={styles.cardRow}>
                <span
                  className={styles.rowIcon}
                  style={{ color: "var(--accent)" }}
                >
                  <ShieldIcon size={15} />
                </span>
                <div style={{ flex: 1 }}>
                  <div className={styles.rowLabel}>Privacy</div>
                  <div className={styles.rowSub}>Who can see your status</div>
                </div>
                <span className={styles.rowVal}>Everyone</span>
              </div>

              <div className={styles.cardRow}>
                <span
                  className={styles.rowIcon}
                  style={{ color: "var(--accent)" }}
                >
                  <InfoIcon size={15} />
                </span>
                <div style={{ flex: 1 }}>
                  <div className={styles.rowLabel}>Version</div>
                  <div className={styles.rowSub}>Echo Messenger v2.0</div>
                </div>
              </div>
            </div>
          </section>

          <div className={styles.logoutSection}>
            <button className={styles.logoutBtn} onClick={handleLogout}>
              <span className={styles.logoutIcon}>
                <FiLogOut />
              </span>
              <span className={styles.logoutText}>Log out</span>
            </button>
          </div>
        </div>
      </aside>
    </>
  );
};

export default SettingsDrawer;
