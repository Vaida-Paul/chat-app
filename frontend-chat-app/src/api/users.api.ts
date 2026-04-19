import client from "./client";
import type { UserDTO } from "@/types";

export const usersApi = {
  /** GET /api/users/search?q= */
  search(query: string): Promise<UserDTO[]> {
    return client
      .get<UserDTO[]>("/users/search", { params: { q: query } })
      .then((r) => r.data);
  },

  /**
   * PATCH /api/users/me  — update display name
   * NOTE: Add this endpoint to your UserController if not yet present.
   * Body: { username: string }
   */
  updateProfile(data: { username: string }): Promise<UserDTO> {
    return client.patch<UserDTO>("/users/me", data).then((r) => r.data);
  },
  uploadAvatar(file: File): Promise<UserDTO> {
    const formData = new FormData();
    formData.append("file", file);
    return client
      .post<UserDTO>("/users/me/avatar", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      })
      .then((r) => r.data);
  },

  removeAvatar(): Promise<UserDTO> {
    return client.delete<UserDTO>("/users/me/avatar").then((r) => r.data);
  },
};
