import { ENV } from "@/src/services/config/env";

let isRefreshing = false;
let refreshPromise: Promise<boolean> | null = null;

export const API_URL = ENV.API_URL;

export async function fetchSeguro(endpoint: string, options: RequestInit = {}) {
  const headers = new Headers(options.headers || {});

  if (!headers.has("Content-Type") && !(options.body instanceof FormData)) {
    headers.set("Content-Type", "application/json");
  }

  let response: Response;

  try {
    response = await fetch(endpoint, {
      ...options,
      headers,
      credentials: "include",
    });
  } catch (error) {
    console.error(`🔌 [NETWORK_ERROR] Imposible conectar con ${endpoint}:`, error);
    throw new Error(
      "No hay conexión con el servidor. Revisa tu internet o el estado del servidor.",
    );
  }

  if (
    response.status === 401 &&
    !endpoint.includes("/auth/login") &&
    !endpoint.includes("/auth/refresh") &&
    !endpoint.includes("/auth/logout")
  ) {
    console.warn(`[API_CLIENT] 🔴 401 Unauthorized detectado en ${endpoint}`);
    console.warn(`[API_CLIENT] 🚑 Iniciando protocolo de rescate (Refresh Token)...`);

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

      if (options.body && options.body instanceof FormData) {
        console.warn(
          "⚠️ No se puede reintentar automáticamente una subida de archivos tras un 401. Cancelando.",
        );
        throw new Error("Sesión renovada. Por favor, vuelve a subir tu archivo.");
      }

      try {
        response = await fetch(endpoint, {
          ...options,
          headers,
          credentials: "include",
        });
      } catch (error) {
        console.error(`🔌 [NETWORK_ERROR] Falló el reintento hacia ${endpoint}:`, error);
        throw new Error("Se perdió la conexión durante el reintento.");
      }
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
