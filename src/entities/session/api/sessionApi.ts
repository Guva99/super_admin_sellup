import { apiFetch, type Result, type StoredTokens } from "@/shared/api";
import type { SessionUser } from "../model/types";

export interface LoginResponse extends StoredTokens {
  user: SessionUser;
}

/** Форма регистрации бизнеса — POST /public/signup. */
export interface SignupInput {
  companyName: string;
  fullName: string;
  email: string;
  password: string;
  phone: string;
  planCode: string;
  slug: string;
}

export const sessionApi = {
  login: (email: string, password: string): Promise<Result<LoginResponse>> =>
    apiFetch("/auth/login", { method: "POST", body: { email, password }, auth: false }),

  logout: (refreshToken: string): Promise<Result<void>> =>
    apiFetch("/auth/logout", { method: "POST", body: { refreshToken }, auth: false }),

  /** Регистрирует бизнес и сразу входит в его кабинет. */
  signup: (input: SignupInput): Promise<Result<LoginResponse>> =>
    apiFetch("/public/signup", { method: "POST", body: input, auth: false }),

  verifyEmail: (token: string): Promise<Result<void>> =>
    apiFetch("/auth/email/verify", { method: "POST", body: { token }, auth: false }),

  /** Ответ всегда пустой: есть ли у почты кабинет, отсюда не узнать. */
  forgotPassword: (email: string): Promise<Result<void>> =>
    apiFetch("/auth/password/forgot", { method: "POST", body: { email }, auth: false }),

  resetPassword: (token: string, password: string): Promise<Result<void>> =>
    apiFetch("/auth/password/reset", { method: "POST", body: { token, password }, auth: false }),
};
