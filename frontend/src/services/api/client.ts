import * as Sentry from "@sentry/nextjs";
import { ENV } from "@/src/services/config/env";

let isRefreshing = false;
let refreshPromise: Promise<boolean> | null = null;

export const API_URL = ENV.API_URL;

interface ExtendedRequestInit extends RequestInit {
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

  const requestId = crypto.randomUUID();
  headers.set("X-Request-ID", requestId);

  if (!headers.has("Content-Type") && !(options.body instanceof FormData)) {
    headers.set("Content-Type", "application/json");
  }

  const config: ExtendedRequestInit = { ...options, headers, credentials: "include" };
  let response: Response;

  try {
    response = await fetch(endpoint, config);
  } catch (error) {
    Sentry.captureException(error, {
      extra: { endpoint, requestId },
    });

    throw new Error("No hay conexión con el servidor.");
  }

  const serverRequestId = response.headers.get("X-Request-ID") || requestId;

  if (!response.ok && response.status !== 401) {
    console.error(
      `🚨 [SERVER_ERROR] ID: ${serverRequestId} | Status: ${response.status} | URL: ${endpoint}`,
    );
  }

  const isCriticalAuthPath =
    endpoint.includes("/auth/login") ||
    endpoint.includes("/auth/register") ||
    endpoint.includes("/auth/refresh");

  if (response.status === 401 && !isCriticalAuthPath) {
    console.warn(`🚑 [RESCATE] 401 en ${endpoint}. Iniciando Silent Refresh...`);

    if (!isRefreshing) {
      isRefreshing = true;
      refreshPromise = (async () => {
        try {
          const refreshRes = await fetch(`${API_URL}/auth/refresh`, {
            method: "POST",
            credentials: "include",
            headers: { "X-Request-ID": `refresh-${serverRequestId}` },
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
      if (typeof window !== "undefined") {
        window.dispatchEvent(new Event("auth:session_recovered"));
      }

      try {
        return await fetch(endpoint, config);
      } catch (error) {
        throw new Error("Error en el reintento de conexión.");
      }
    } else {
      if (typeof window !== "undefined") {
        window.dispatchEvent(new Event("auth:unauthorized"));
      }
      return response;
    }
  }

  return response;
}
