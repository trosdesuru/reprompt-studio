// src/services/api/auth.ts
import { UserLogin, UserRegister } from "@/src/types/auth.types";
import { fetchSeguro } from "./client";
import { ENV } from "@/src/services/config/env";

const API_URL = ENV.API_URL;
if (process.env.NODE_ENV === "development") {
  console.log("🕵️‍♂️ [DEBUG] Valor real de API_URL inyectado por Next:", API_URL);
}

const JSON_DATA = async (res: Response) => {
  if (!res.ok) {
    const errorData = await res
      .clone()
      .json()
      .catch(() => ({}));

    throw new Error(errorData.detail || errorData.message || `Error del servidor (${res.status})`);
  }
  if (res.status === 204) return null;
  return res.json().catch(() => ({}));
};

export const authApi = {
  register: (data: UserRegister) =>
    fetchSeguro(`${API_URL}/auth/register`, {
      method: "POST",
      body: JSON.stringify(data),
    }).then(JSON_DATA),

  login: (credentials: UserLogin) =>
    fetchSeguro(`${API_URL}/auth/login`, {
      method: "POST",
      body: JSON.stringify(credentials),
    }).then(JSON_DATA),

  logout: async () => {
    await fetchSeguro(`${API_URL}/auth/logout`, { method: "POST" });
    window.location.href = "/login";
  },

  cambiarPassword: (data: any) =>
    fetchSeguro(`${API_URL}/auth/change-password`, {
      method: "PUT",
      body: JSON.stringify(data),
    }).then(JSON_DATA),

  me: () =>
    fetchSeguro(`${API_URL}/auth/me`, {
      method: "GET",
      cache: "no-store",
      headers: {
        "Cache-Control": "no-cache, no-store, must-revalidate",
        Pragma: "no-cache",
        Expires: "0",
      },
    }).then(JSON_DATA),

  generarInvitacion: (role: string = "voyager") =>
    fetchSeguro(`${API_URL}/auth/admin/invite-codes`, {
      method: "POST",
      body: JSON.stringify({ role_requested: role }),
      headers: {
        "Content-Type": "application/json",
      },
    }).then(JSON_DATA),

  obtenerLogsAuditoria: (limit: number = 50) =>
    fetchSeguro(`${API_URL}/auth/admin/logs?limit=${limit}`).then(JSON_DATA),

  revocarTodasLasSesiones: () =>
    fetchSeguro(`${API_URL}/auth/admin/sessions/revoke-all`, { method: "POST" }).then(JSON_DATA),

  refrescarToken: () => fetchSeguro(`${API_URL}/auth/refresh`, { method: "POST" }).then(JSON_DATA),

  getGoogleAuthUrl: () =>
    fetchSeguro(`${API_URL}/auth/google/url`, { method: "GET" }).then(JSON_DATA),

  verifyGoogleCode: (data: { code: string; redirect_uri: string }) =>
    fetchSeguro(`${API_URL}/auth/google/callback`, {
      method: "POST",
      body: JSON.stringify(data),
    }).then(JSON_DATA),

  registerGoogleUser: (data: { token: string; invite_code: string; username: string }) =>
    fetchSeguro(`${API_URL}/auth/google/join`, {
      method: "POST",
      body: JSON.stringify(data),
    }).then(JSON_DATA),

  getDiscordAuthUrl: () =>
    fetchSeguro(`${API_URL}/auth/discord/url`, { method: "GET" }).then(JSON_DATA),

  verifyDiscordCode: (data: { code: string; redirect_uri: string }) =>
    fetchSeguro(`${API_URL}/auth/discord`, {
      method: "POST",
      body: JSON.stringify(data),
    }).then(JSON_DATA),
};
