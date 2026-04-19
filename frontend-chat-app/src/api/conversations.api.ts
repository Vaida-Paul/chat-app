import client from "./client";
import type {
  ConversationDTO,
  CreateConversationRequest,
  PageResponse,
} from "@/types";

function toConversationDTO(backend: any): ConversationDTO {
  return {
    id: backend.id,
    recipientId: backend.otherUser.id,
    recipientUsername: backend.otherUser.username,
    recipientInviteCode: backend.otherUser.inviteCode,
    recipientAvatarUrl: backend.otherUser.avatarUrl,
    lastMessageContent: backend.lastMessage?.content ?? null,
    lastMessageTimestamp: backend.lastMessageTimestamp ?? null,
    lastMessageSenderId: backend.lastMessage?.senderId ?? null,
    unreadCount: backend.unreadCount,
    online: false,
    blocked: false,
  };
}

export const conversationsApi = {
  /**
   * GET /api/conversations?page=0&size=20
   * Sorted by lastMessageTimestamp DESC (server-side).
   */
  list(page = 0, size = 20): Promise<PageResponse<ConversationDTO>> {
    return client
      .get<any>("/conversations", { params: { page, size } })
      .then((r) => {
        const backendPage = r.data;
        return {
          ...backendPage,
          content: backendPage.content.map(toConversationDTO),
        };
      });
  },

  /**
   * POST /api/conversations  body: { recipientId }
   * Returns the new (or existing) ConversationDTO.
   */
  create(data: CreateConversationRequest): Promise<ConversationDTO> {
    return client
      .post<any>("/conversations", data)
      .then((r) => toConversationDTO(r.data));
  },
};
