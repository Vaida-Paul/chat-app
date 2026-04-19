import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { AuthResponse, UserDTO } from "@/types";

interface AuthState {
  token: string | null;
  user: UserDTO | null;
  isAuthenticated: boolean;

  setAuth: (response: AuthResponse) => void;
  updateUser: (partial: Partial<UserDTO>) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      token: null,
      user: null,
      isAuthenticated: false,

      setAuth(response) {
        localStorage.setItem("echo_token", response.token);

        const user: UserDTO = {
          id: response.id,
          username: response.username ?? response.email,
          email: response.email,
          code: response.code,
          avatarUrl: response.avatarUrl,
        };

        set({ token: response.token, user, isAuthenticated: true });
      },

      updateUser(partial) {
        set((state) => ({
          user: state.user ? { ...state.user, ...partial } : null,
        }));
      },

      logout() {
        localStorage.removeItem("echo_token");
        set({ token: null, user: null, isAuthenticated: false });
      },
    }),
    {
      name: "echo-auth",
      partialize: (state) => ({ token: state.token, user: state.user }),
      onRehydrateStorage: () => (state) => {
        if (state?.token && state.user) {
          state.isAuthenticated = true;

          localStorage.setItem("echo_token", state.token);
        }
      },
    },
  ),
);
