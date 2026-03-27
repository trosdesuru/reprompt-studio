// frontend/src/services/api/client.ts

export const API_URL = (process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000") + "/api";

// 🟢 Variables globales en memoria para gestionar la concurrencia
let isRefreshing = false;
let failedQueue: Array<{ resolve: (value?: unknown) => void; reject: (reason?: any) => void }> = [];

// Procesa la cola de peticiones en espera
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

// 🟢 Mejoramos el tipado genérico <T> para no abusar de "any"
export const fetchSeguro = async <T = any>(
  url: string,
  options: RequestInit = {},
  retries = 1,
): Promise<T> => {
  const res = await fetch(url, {
    ...options,
    credentials: "include",
  });

  // Si da 401 y tenemos reintentos disponibles...
  if (res.status === 401 && retries > 0) {
    // 1. Si YA estamos refrescando, nos unimos a la cola de espera
    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        failedQueue.push({ resolve, reject });
      })
        .then(() => {
          // Cuando el refresco termine con éxito, reintentamos la petición original
          return fetchSeguro<T>(url, options, 0);
        })
        .catch((err) => {
          throw err;
        });
    }

    // 2. Si nadie está refrescando, bloqueamos la puerta e iniciamos el refresco
    isRefreshing = true;
    console.log("🔑 Access Token caducado. Iniciando refresco silencioso maestro...");

    try {
      const refreshRes = await fetch(`${API_URL}/auth/refresh`, {
        method: "POST",
        credentials: "include",
      });

      if (refreshRes.ok) {
        console.log("✅ Token mutado. Liberando peticiones en cola...");
        processQueue(null); // Avisamos a las otras peticiones que pueden continuar
        return await fetchSeguro<T>(url, options, 0); // Reintentamos la nuestra
      } else {
        throw new Error("El servidor rechazó el refresco.");
      }
    } catch (err) {
      console.error("❌ Fallo crítico en el refresco:", err);
      processQueue(err as Error); // Avisamos a la cola de que todo falló

      // Expulsión limpia
      if (typeof window !== "undefined" && window.location.pathname !== "/login") {
        window.location.href = "/login";
      }
      throw new Error("Sesión expirada de forma definitiva.");
    } finally {
      // Pase lo que pase, abrimos la puerta para futuros intentos
      isRefreshing = false;
    }
  }

  // Parseo de errores HTTP estándar (400, 404, 500...)
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.detail || `HTTP error! status: ${res.status}`);
  }

  // Devolvemos el JSON tipado
  return res.json();
};
