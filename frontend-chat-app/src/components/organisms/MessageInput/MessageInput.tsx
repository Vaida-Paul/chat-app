import React, { useState, useRef } from "react";
import { SendIcon, AttachIcon } from "@/components/atoms/Icons";
import { useTyping } from "@/hooks/useTyping";
import { attachmentsApi } from "@/api/attachments.api";
import Spinner from "@/components/atoms/Spinner/Spinner";
import styles from "./MessageInput.module.scss";
import { AiFillPicture } from "react-icons/ai";

interface Props {
  conversationId: number;
  onSend: (
    text: string,
    attachmentUrl?: string,
    attachmentType?: string,
  ) => void;
  disabled?: boolean;
}

const MessageInput: React.FC<Props> = ({
  conversationId,
  onSend,
  disabled,
}) => {
  const [value, setValue] = useState("");
  const [uploading, setUploading] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { onInput, onStopTyping } = useTyping(disabled ? null : conversationId);

  const autoResize = () => {
    const ta = textareaRef.current;
    if (ta) {
      ta.style.height = "auto";
      ta.style.height = Math.min(ta.scrollHeight, 120) + "px";
    }
  };
  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newValue = e.target.value;
    setValue(newValue);
    if (newValue.trim() === "") {
      onStopTyping();
    } else {
      onInput();
    }
    autoResize();
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      submit();
    }
  };

  const submit = (attachmentUrl?: string, attachmentType?: string) => {
    const text = value.trim();
    if ((!text && !attachmentUrl) || disabled) return;
    onStopTyping();
    onSend(text, attachmentUrl, attachmentType);
    setValue("");
    if (textareaRef.current) textareaRef.current.style.height = "auto";
  };

  const handleAttachClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const { url, type } = await attachmentsApi.upload(file);

      submit(url, type);
    } catch (err) {
      console.error("Upload failed", err);
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  return (
    <div className={styles.wrap}>
      <div className={styles.row}>
        <div className={styles.inputBox}>
          <textarea
            ref={textareaRef}
            className={styles.textarea}
            rows={1}
            placeholder="Type a message…"
            value={value}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            disabled={disabled || uploading}
          />
          <button
            className={styles.iconBtn}
            title="Attach image"
            type="button"
            onClick={handleAttachClick}
            disabled={uploading}
          >
            {uploading ? <Spinner size={14} /> : <AiFillPicture size={17} />}
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            style={{ display: "none" }}
            onChange={handleFileChange}
          />
        </div>
        <button
          className={styles.sendBtn}
          onClick={() => submit()}
          disabled={(!value.trim() && !uploading) || disabled}
          title="Send"
          type="button"
        >
          <SendIcon size={16} />
        </button>
      </div>
    </div>
  );
};

export default MessageInput;
