import { ENV } from "@/src/services/config/env";

let isRefreshing = false;
let refreshPromise: Promise<boolean> | null = null;

export const API_URL = ENV.API_URL;
export interface ExtendedRequestInit extends RequestInit {
  next?: {
    revalidate?: number;
    tags?: string[];
  };
}

export async function fetchSeguro(
  endpoint: string,
  options: ExtendedRequestInit = {},
): Promise<Response> {
  const headers = new Headers(options.headers || {});

  if (!headers.has("Content-Type") && !(options.body instanceof FormData)) {
    headers.set("Content-Type", "application/json");
  }

  const config: ExtendedRequestInit = {
    ...options,
    headers,
    credentials: "include",
  };

  console.log(`📡 [API_CLIENT] PETICIÓN -> ${options.method || "GET"} ${endpoint}`);

  let response: Response;

  try {
    response = await fetch(endpoint, config);
    console.log(`📥 [API_CLIENT] RESPUESTA <- ${endpoint} [Status: ${response.status}]`);
  } catch (error) {
    console.error(`🔌 [NETWORK_ERROR] Fallo físico de conexión con ${endpoint}:`, error);
    throw new Error("No hay conexión con el servidor.");
  }

  const isAuthFlow = endpoint.includes("/auth");

  if (response.status === 401 && !isAuthFlow) {
    console.warn(`🚑 [API_CLIENT] 401 Detectado en ${endpoint}. Intentando rescate (Refresh)...`);

    if (!isRefreshing) {
      isRefreshing = true;
      console.log("🔄 [SECURITY] Solicitando nuevo Access Token al servidor...");
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
      console.log(`✅ [SECURITY] Sesión renovada con éxito. Reintentando operación original...`);

      if (options.body instanceof FormData) {
        console.warn("⚠️ [SECURITY] Petición con FormData cancelada tras refresh.");
        return response;
      }

      try {
        response = await fetch(endpoint, config);
        console.log(
          `🔁 [API_CLIENT] Reintento tras refresh <- ${endpoint} [Status: ${response.status}]`,
        );
      } catch (error) {
        console.error("❌ [API_CLIENT] Error físico en el reintento post-refresh.");
        throw new Error("Error en el reintento de conexión.");
      }
    } else {
      console.error("🚷 [SECURITY] Refresh fallido. La sesión ha muerto definitivamente.");
      if (typeof window !== "undefined") {
        window.dispatchEvent(new Event("auth:unauthorized"));
      }
      return response;
    }
  }

  if (!response.ok) {
    const errorBody = await response
      .clone()
      .json()
      .catch(() => ({}));
    console.warn(`🛑 [API_ERROR] ${response.status} en ${endpoint}:`, errorBody);

    if (response.status === 429) {
      const mensaje = errorBody.detail || "Demasiados intentos. Espera un momento.";
      if (typeof window !== "undefined") {
        window.dispatchEvent(
          new CustomEvent("app:notification", { detail: { type: "warning", message: mensaje } }),
        );
      }
    }
  }
  return response;
}
