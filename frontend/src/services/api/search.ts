import { fetchSeguro } from "./client";
import { ENV } from "@/src/services/config/env";

const API_URL = ENV.API_URL;

export const SearchService = {
  buscarEnStudio: async (query: string, limit: number = 20) => {
    const startTime = performance.now();
    try {
      const params = new URLSearchParams({ q: query, limit: limit.toString() });
      const response = await fetchSeguro(`${API_URL}/studio?${params.toString()}`, {
        method: "GET",
      });

      if (process.env.NODE_ENV === "development") {
        const duration = (performance.now() - startTime).toFixed(2);
        console.info(`⚡ [SEARCH_TELEMETRY] Búsqueda de "${query}" completada en ${duration}ms`);
      }

      return await response.json();
    } catch (error) {
      console.error(`🚨 [SEARCH_ERROR] Fallo al buscar "${query}":`, error);
      throw error;
    }
  },
};

export const searchApi = {
  buscar: (
    query: string,
    next_id: string | null = null,
    categories: Record<string, boolean> | null = null,
  ) => {
    let endpoint = `${API_URL}/buscar?query=${encodeURIComponent(query)}`;
    if (next_id) endpoint += `&next_id=${next_id}`;
    if (categories) endpoint += `&categories=${encodeURIComponent(JSON.stringify(categories))}`;
    return fetchSeguro(endpoint);
  },
  leer: (url: string, p: number = 0) =>
    fetchSeguro(`${API_URL}/leer?url=${encodeURIComponent(url)}&p=${p}`),

  resolverImagen: (url: string) =>
    fetchSeguro(`${API_URL}/resolver_imagen?url=${encodeURIComponent(url)}`),

  getTrends: (limit: number = 5) => fetchSeguro(`${API_URL}/tendencias?limit=${limit}`),

  registerInteraction: (
    item: { url: string; title: string; thumb: string },
    type: "view" | "download",
  ) =>
    fetchSeguro(`${API_URL}/interact`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        url: item.url,
        title: item.title,
        thumb: item.thumb,
        interaction_type: type,
      }),
    }),
};
