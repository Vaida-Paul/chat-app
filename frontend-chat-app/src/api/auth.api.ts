import client from "./client";
import type {
  AuthResponse,
  LoginRequest,
  RegisterRequest,
  UserDTO,
} from "@/types";

export const authApi = {
  /** POST /api/auth/login */
  login(data: LoginRequest): Promise<AuthResponse> {
    return client.post<AuthResponse>("/auth/login", data).then((r) => r.data);
  },

  /** POST /api/auth/register — sends verification email, returns no token */
  register(data: RegisterRequest): Promise<void> {
    return client.post("/auth/register", data).then(() => undefined);
  },

  /** GET /api/auth/me → UserDTO */
  me(): Promise<UserDTO> {
    return client.get<UserDTO>("/auth/me").then((r) => r.data);
  },

  /** GET /api/auth/verify-email?token=... → AuthResponse (auto-login on verify) */
  verifyEmail(token: string): Promise<AuthResponse> {
    return client
      .get<AuthResponse>(`/auth/verify-email?token=${token}`)
      .then((r) => r.data);
  },

  /** POST /api/auth/resend-verification */
  resendVerification(email: string): Promise<void> {
    return client
      .post("/auth/resend-verification", { email })
      .then(() => undefined);
  },

  /** POST /api/auth/forgot-password */
  forgotPassword(email: string): Promise<void> {
    return client
      .post("/auth/forgot-password", { email })
      .then(() => undefined);
  },

  /** POST /api/auth/reset-password */
  resetPassword(token: string, password: string): Promise<void> {
    return client
      .post("/auth/reset-password", { token, password })
      .then(() => undefined);
  },
};
