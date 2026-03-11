import client from "./client";
import type {
  AuthResponse,
  LoginRequest,
  RegisterRequest,
  User,
} from "../types";

const mapBackendUser = (backendUser: any): User => ({
  id: backendUser.id?.toString() || "",
  username: backendUser.username,
  email: backendUser.email,
  code: backendUser.code || "",
  avatarUrl: backendUser.avatarUrl,
  online: backendUser.online,
  lastSeen: backendUser.lastSeen,
});

export const authApi = {
  async login(data: LoginRequest): Promise<AuthResponse> {
    const response = await client.post<{
      token: string;
      email: string;
      id: number;
    }>("/auth/login", data);
    const { token, email, id } = response.data;

    localStorage.setItem("token", token);

    const fullUser = await this.me();

    return { token, user: fullUser };
  },

  async register(data: RegisterRequest): Promise<AuthResponse> {
    const payload = {
      username: data.username,
      email: data.email,
      password: data.password,
      captchaToken: data.captchaToken,
    };

    const response = await client.post<{
      token: string;
      email: string;
      id: number;
    }>("/auth/register", payload);

    const { token } = response.data;
    localStorage.setItem("token", token);
    const fullUser = await this.me();

    return { token, user: fullUser };
  },

  async logout(): Promise<void> {
    await client.post("/auth/logout").catch(() => {});
    localStorage.removeItem("token");
  },

  async me(): Promise<User> {
    const response = await client.get("/auth/me");
    return mapBackendUser(response.data);
  },
};
