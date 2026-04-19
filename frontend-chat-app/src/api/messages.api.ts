import client from "./client";
import type { MessageDTO, PageResponse } from "@/types";

export const messagesApi = {
  /**
   * GET /api/conversations/:conversationId/messages?page=0&size=20
   * Returns Spring Page<MessageDTO>. Default sort is by createdAt asc (server decides).
   */
  list(
    conversationId: number,
    page = 0,
    size = 20,
  ): Promise<PageResponse<MessageDTO>> {
    return client
      .get<
        PageResponse<MessageDTO>
      >(`/conversations/${conversationId}/messages`, { params: { page, size } })
      .then((r) => r.data);
  },

  /**
   * DELETE /api/conversations/:conversationId/messages/:messageId
   * Soft-deletes the message (sets deleted=true, content=null).
   * Returns 204 No Content.
   */
  delete(conversationId: number, messageId: number): Promise<void> {
    return client
      .delete(`/conversations/${conversationId}/messages/${messageId}`)
      .then(() => undefined);
  },
};
