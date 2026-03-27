import { API_URL, fetchSeguro } from "./client";

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

  obtenerTendencias: (limit: number = 5) => fetchSeguro(`${API_URL}/tendencias?limit=${limit}`),
};
