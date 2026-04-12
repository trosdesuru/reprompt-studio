import { ENV } from "@/src/services/config/env";

let isRefreshing = false;
let refreshPromise: Promise<boolean> | null = null;

export const API_URL = ENV.API_URL;

export async function fetchSeguro(endpoint: string, options: RequestInit = {}) {
  const headers = new Headers(options.headers || {});

  if (!headers.has("Content-Type") && !(options.body instanceof FormData)) {
    headers.set("Content-Type", "application/json");
  }

  const config: RequestInit = {
    ...options,
    headers,
    credentials: "include",
  };

  let response: Response;

  try {
    response = await fetch(endpoint, config);
  } catch (error) {
    console.error(`🔌 [NETWORK_ERROR] Fallo al conectar con ${endpoint}:`, error);
    throw new Error("No hay conexión con el servidor.");
  }

  const isAuthFlow = endpoint.includes("/auth/");

  // 🛡️ PROTOCOLO DE RESCATE: Si hay 401 y no es una ruta de login/refresh
  if (response.status === 401 && !isAuthFlow) {
    console.warn(`[API_CLIENT] 🚑 401 Detectado en ${endpoint}. Iniciando Refresh...`);

    if (!isRefreshing) {
      isRefreshing = true;
      refreshPromise = (async () => {
        try {
          const refreshRes = await fetch(`${API_URL}/auth/refresh`, {
            method: "POST",
            credentials: "include",
          });
          return refreshRes.ok;
        } catch {
          return false;
        } finally {
          isRefreshing = false;
        }
      })();
    }

    const refreshSuccessful = await refreshPromise;

    if (refreshSuccessful) {
      console.log(`✅ [SECURITY] Sesión renovada. Reintentando petición...`);

      // FormData no se puede reintentar fácilmente si el stream ya se leyó
      if (options.body instanceof FormData) {
        throw new Error("Sesión renovada. Por seguridad, vuelve a subir el archivo.");
      }

      try {
        // Reintento final
        response = await fetch(endpoint, config);
      } catch (error) {
        throw new Error("Error en el reintento de conexión.");
      }
    } else {
      console.error("🚷 [SECURITY] Refresh fallido. Expulsando usuario...");
      if (typeof window !== "undefined") {
        window.dispatchEvent(new Event("auth:unauthorized"));
      }
      throw new Error("Sesión expirada.");
    }
  }

  // 401 en flujo de Auth, es que las credenciales son malas
  else if (response.status === 401 && isAuthFlow) {
    throw new Error("Credenciales inválidas.");
  }

  // Manejo de Rate Limit
  if (response.status === 429) {
    const errorData = await response.json().catch(() => ({}));
    const mensaje = errorData.detail || "Demasiados intentos. Espera un momento.";
    if (typeof window !== "undefined") {
      window.dispatchEvent(
        new CustomEvent("app:notification", { detail: { type: "warning", message: mensaje } }),
      );
    }
    throw new Error(mensaje);
  }

  if (!response.ok) {
    throw new Error(`Error ${response.status}: ${response.statusText}`);
  }

  return response.json();
}
