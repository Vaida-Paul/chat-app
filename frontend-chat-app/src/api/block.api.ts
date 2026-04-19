import client from './client';

export const blockApi = {
  /**
   * POST /api/block/:userId
   * Blocks the user with the given ID.
   */
  block(userId: number): Promise<void> {
    return client.post(`/block/${userId}`).then(() => undefined);
  },

  /**
   * DELETE /api/block/:userId
   * Unblocks the user with the given ID.
   */
  unblock(userId: number): Promise<void> {
    return client.delete(`/block/${userId}`).then(() => undefined);
  },
};
