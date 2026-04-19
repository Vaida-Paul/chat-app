import client from './client';
import type { PresenceStatusDTO } from '@/types';

export const presenceApi = {
  /** GET /api/presence/status/:userId */
  getUserStatus(userId: number): Promise<PresenceStatusDTO> {
    return client.get<PresenceStatusDTO>(`/presence/status/${userId}`).then((r) => r.data);
  },

  /** GET /api/presence/friends */
  getFriends(): Promise<PresenceStatusDTO[]> {
    return client.get<PresenceStatusDTO[]>('/presence/friends').then((r) => r.data);
  },
};
