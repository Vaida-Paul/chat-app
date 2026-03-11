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
  user: User;
}

export interface User {
  id: string;
  username: string;
  email: string;
  code: string;
  avatarUrl?: string;
  online?: boolean;
  lastSeen?: string;
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
  | "ember";

export interface ThemeDef {
  name: string;
  icon: string;
  dark: boolean;
  vars: Record<string, string>;
}
