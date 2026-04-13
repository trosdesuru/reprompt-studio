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

  // 🕵️‍♂️ SENSOR 1: El Vigía de Salida
  console.log(`📡 [API_CLIENT] PETICIÓN -> ${options.method || "GET"} ${endpoint}`);

  let response: Response;

  try {
    response = await fetch(endpoint, config);
    // 🕵️‍♂️ SENSOR 2: El Notario de Entrada
    console.log(`📥 [API_CLIENT] RESPUESTA <- ${endpoint} [Status: ${response.status}]`);
  } catch (error) {
    console.error(`🔌 [NETWORK_ERROR] Fallo crítico de conexión con ${endpoint}:`, error);
    throw new Error("No hay conexión con el servidor.");
  }

  const isAuthFlow = endpoint.includes("/auth/");

  // 🛡️ PROTOCOLO DE RESCATE: 401 en rutas privadas
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
        throw new Error("Sesión renovada. Por seguridad, vuelve a subir el archivo.");
      }

      try {
        response = await fetch(endpoint, config);
        console.log(`🔁 [API_CLIENT] Reintento tras refresh <- ${endpoint} [Status: ${response.status}]`);
      } catch (error) {
        console.error("❌ [API_CLIENT] Error en el reintento post-refresh.");
        throw new Error("Error en el reintento de conexión.");
      }
    } else {
      console.error("🚷 [SECURITY] Refresh fallido. La sesión ha muerto definitivamente.");
      if (typeof window !== "undefined") {
        window.dispatchEvent(new Event("auth:unauthorized"));
      }
      throw new Error("Sesión expirada.");
    }
  }

  // 🕵️‍♂️ SENSOR 3: El Forense (Analiza el cuerpo del error antes de lanzarlo)
  if (!response.ok) {
    const errorBody = await response.clone().json().catch(() => ({}));
    console.warn(`🛑 [API_ERROR] ${response.status} en ${endpoint}:`, errorBody);

    if (response.status === 401 && isAuthFlow) {
      throw new Error("Credenciales inválidas.");
    }

    if (response.status === 429) {
      const mensaje = errorBody.detail || "Demasiados intentos. Espera un momento.";
      if (typeof window !== "undefined") {
        window.dispatchEvent(
          new CustomEvent("app:notification", { detail: { type: "warning", message: mensaje } }),
        );
      }
      throw new Error(mensaje);
    }

    throw new Error(`Error ${response.status}: ${errorBody.detail || response.statusText}`);
  }

  return response.json();
}