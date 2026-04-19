import React from "react";
import { getInitials, getAvatarClass } from "@/utils/string.utils";
import styles from "./Avatar.module.scss";

interface Props {
  name: string;
  size?: number;
  online?: boolean;
  showOnline?: boolean;
  className?: string;
  avatarUrl?: string;
}

const Avatar: React.FC<Props> = ({
  name,
  size = 46,
  online = false,
  showOnline = false,
  className,
  avatarUrl,
}) => {
  const fontSize = Math.round(size * 0.36);
  const cls = getAvatarClass(name);

  return (
    <div
      className={`${styles.wrap} ${className ?? ""}`}
      style={{ width: size, height: size }}
    >
      {avatarUrl ? (
        <img
          src={avatarUrl}
          alt={name}
          className={styles.avatarImage}
          style={{
            width: size,
            height: size,
            objectFit: "cover",
            borderRadius: "50%",
          }}
        />
      ) : (
        <div
          className={`${styles.avatar} ${styles[cls]}`}
          style={{ width: size, height: size, fontSize }}
        >
          {getInitials(name)}
        </div>
      )}
      {showOnline && (
        <span
          className={`${styles.dot} ${online ? styles.online : styles.offline}`}
        />
      )}
    </div>
  );
};
export default Avatar;
