import { ENV } from "@/src/services/config/env";

let isRefreshing = false;
let refreshPromise: Promise<boolean> | null = null;

export const API_URL = ENV.API_URL;
export async function fetchSeguro(endpoint: string, options: RequestInit = {}) {
  let response = await fetch(endpoint, {
    ...options,
    credentials: "include",
  });

  if (
    response.status === 401 &&
    !endpoint.includes("/auth/login") &&
    !endpoint.includes("/auth/refresh")
  ) {
    console.warn(
      `🔄 [SECURITY] Access Token expirado en ${endpoint}. Intentando rotación transparente...`,
    );

    if (!isRefreshing) {
      isRefreshing = true;
      refreshPromise = (async () => {
        try {
          const refreshRes = await fetch(`${API_URL}/auth/refresh`, {
            method: "POST",
            credentials: "include",
          });
          return refreshRes.ok;
        } catch (error) {
          return false;
        } finally {
          isRefreshing = false;
        }
      })();
    }

    const refreshSuccessful = await refreshPromise;

    if (refreshSuccessful) {
      console.log(`✅ [SECURITY] Rotación exitosa. Reintentando petición original a ${endpoint}`);
      response = await fetch(endpoint, {
        ...options,
        credentials: "include",
      });
    } else {
      console.error("🚷 [SECURITY] Refresh Token inválido. Sesión terminada.");
      if (typeof window !== "undefined") {
        window.dispatchEvent(new Event("auth:unauthorized"));
      }
      throw new Error("Sesión expirada completamente");
    }
  }

  if (!response.ok) {
    console.error(`❌ [API_ERROR] Fallo en ${endpoint}: ${response.status} ${response.statusText}`);
    throw new Error(`Error ${response.status}: ${response.statusText}`);
  }

  return response.json();
}
