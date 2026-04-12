import { UserLogin, UserRegister } from "@/src/types/auth.types";
import { fetchSeguro } from "./client";
import { ENV } from "@/src/services/config/env";

const API_URL = ENV.API_URL;
console.log("🕵️‍♂️ [DEBUG] Valor real de API_URL inyectado por Next:", API_URL);

export const authApi = {
  register: (data: UserRegister) =>
    fetchSeguro(`${API_URL}/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    }),
  login: (credentials: UserLogin) =>
    fetchSeguro(`${API_URL}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(credentials),
    }),
  logout: async () => {
    await fetchSeguro(`${API_URL}/auth/logout`, { method: "POST" });
    window.location.href = "/login";
  },
  cambiarPassword: (data: any) =>
    fetchSeguro(`${API_URL}/auth/change-password`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    }),
  me: async () => {
    return fetchSeguro(`${API_URL}/auth/me`, {
      method: "GET",
    });
  },
  generarInvitacion: (role: string = "voyager") =>
    fetchSeguro(`${API_URL}/auth/invite-codes?role_requested=${role}`, { method: "POST" }),
  obtenerLogsAuditoria: (limit: number = 50) =>
    fetchSeguro(`${API_URL}/auth/admin/logs?limit=${limit}`),
  revocarTodasLasSesiones: () =>
    fetchSeguro(`${API_URL}/auth/admin/sessions/revoke-all`, { method: "POST" }),
  refrescarToken: () => fetchSeguro(`${API_URL}/auth/refresh`, { method: "POST" }),

  getGoogleAuthUrl: async () => {
    return fetchSeguro(`${API_URL}/auth/google/url`, { method: "GET" });
  },

  verifyGoogleCode: async (data: { code: string; redirect_uri: string }) => {
    return fetchSeguro(`${API_URL}/auth/google/callback`, {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  registerGoogleUser: async (data: { token: string; invite_code: string; username: string }) => {
    return fetchSeguro(`${API_URL}/auth/google/join`, {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  getDiscordAuthUrl: async () => {
    return fetchSeguro(`${API_URL}/auth/discord/url`, { method: "GET" });
  },

  verifyDiscordCode: async (data: { code: string; redirect_uri: string }) => {
    return fetchSeguro(`${API_URL}/auth/discord`, {
      method: "POST",
      body: JSON.stringify(data),
    });
  },
};
