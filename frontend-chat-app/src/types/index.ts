export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  username: string;
  email: string;
  password: string;
  captchaToken: string;
}

export interface AuthResponse {
  token: string;
  id: number;
  email: string;
  username?: string;
  code?: string;
  avatarUrl?: string;
}

export interface UserDTO {
  id: number;
  username: string;
  email: string;
  code?: string;
  avatarUrl?: string;
}

export interface ConversationDTO {
  id: number;
  recipientId: number;
  recipientUsername: string;
  recipientInviteCode: string;
  recipientAvatarUrl?: string;
  lastMessageContent: string | null;
  lastMessageTimestamp: string | null;
  lastMessageSenderId: number | null;
  unreadCount: number;
  online?: boolean;
  blocked?: boolean;
}

export interface CreateConversationRequest {
  recipientId: number;
}

export type MessageStatus = "SENT" | "DELIVERED" | "READ";

export interface MessageDTO {
  id: number;
  content: string | null;
  senderId: number;
  senderUsername: string;
  senderAvatarUrl?: string;
  createdAt: string;
  deleted: boolean;
  status: MessageStatus;
  conversationId: number;
  attachmentUrl?: string;
  attachmentType?: string;
}

export interface PageResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  number: number;
  size: number;
  last: boolean;
}

export interface PresenceStatusDTO {
  userId: number;
  online: boolean;
}

export interface StompMessagePayload {
  conversationId: number;
  content: string;
  attachmentUrl?: string;
  attachmentType?: string;
}

export interface StompTypingPayload {
  conversationId: number;
  typing: boolean;
}

export interface StompReadReceiptPayload {
  conversationId: number;
  lastReadMessageId: number;
}

export interface StompDeliveryReceiptPayload {
  messageId: number;
}

export type ThemeKey =
  | "midnight"
  | "arctic"
  | "rose"
  | "forest"
  | "sand"
  | "ocean"
  | "graphite"
  | "lavender"
  | "ember"
  | "galaxy"
  | "lipstick_matte"
  | "candy";

export interface ThemeDef {
  name: string;
  icon: string;
  dark: boolean;
  vars: Record<string, string>;
}
