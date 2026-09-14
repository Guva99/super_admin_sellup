import { apiFetch, type Result, type StoredTokens } from "@/shared/api";
import type { SessionUser } from "../model/types";

interface LoginResponse extends StoredTokens {
  user: SessionUser;
}

export const sessionApi = {
  login: (email: string, password: string): Promise<Result<LoginResponse>> =>
    apiFetch("/auth/login", { method: "POST", body: { email, password }, auth: false }),

  logout: (refreshToken: string): Promise<Result<void>> =>
    apiFetch("/auth/logout", { method: "POST", body: { refreshToken }, auth: false }),
};
