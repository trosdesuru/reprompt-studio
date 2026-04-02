import { AuthError, NetworkError } from "@/src/utils/errors/AppErrors";

let isRefreshing = false;
let failedQueue: Array<{ resolve: (value?: unknown) => void; reject: (reason?: any) => void }> = [];

const isServer = typeof window === "undefined";
const getInternalUrl = () => {
  const url = process.env.INTERNAL_API_URL || "http://backend:8000";
  return url.endsWith("/api") ? url : `${url}/api`;
};

const getBrowserUrl = () => {
  const url = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
  return url.endsWith("/api") ? url : `${url}/api`;
};

export const API_URL = isServer ? getInternalUrl() : getBrowserUrl();

const processQueue = (error: Error | null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve();
    }
  });
  failedQueue = [];
};

export const fetchSeguro = async <T = any>(
  url: string,
  options: RequestInit = {},
  retries = 1,
): Promise<T> => {
  const res = await fetch(url, {
    ...options,
    credentials: "include",
  });

  if (res.status === 401 && retries > 0) {
    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        failedQueue.push({ resolve, reject });
      })
        .then(() => {
          return fetchSeguro<T>(url, options, 0);
        })
        .catch((err) => {
          throw err;
        });
    }

    isRefreshing = true;
    console.log("🔑 Access Token caducado. Iniciando refresco silencioso maestro...");

    try {
      const refreshRes = await fetch(`${API_URL}/auth/refresh`, {
        method: "POST",
        credentials: "include",
      });

      if (refreshRes.ok) {
        console.log("✅ Token mutado. Liberando peticiones en cola...");
        processQueue(null);
        return await fetchSeguro<T>(url, options, 0);
      } else {
        throw new Error("El servidor rechazó el refresco.");
      }
    } catch (err) {
      processQueue(err as Error);

      throw new AuthError("Sesión expirada de forma definitiva.");
    } finally {
      isRefreshing = false;
    }
  }

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new NetworkError(errorData.detail || "Fallo en la petición HTTP", res.status);
  }

  return res.json();
};
