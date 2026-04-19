import { API_URL, fetchSeguro } from "./client";

const RESERVED_ROUTES = new Set([
  "login",
  "register",
  "join",
  "admin",
  "studio",
  "reprompt",
  "api",
  "_next",
  "favicon.ico",
]);

export const publicApi = {
  getProfile: async (username: string) => {
    if (RESERVED_ROUTES.has(username.toLowerCase())) {
      return Promise.reject(new Error("Ruta reservada del sistema"));
    }
    return fetchSeguro(`${API_URL}/public/profile/${username}`);
  },

  getDirectory: async (username: string, slug: string) => {
    if (RESERVED_ROUTES.has(username.toLowerCase())) {
      return Promise.reject(new Error("Ruta reservada del sistema"));
    }
    return fetchSeguro(`${API_URL}/public/profile/${username}/${slug}`);
  },

  getPromptDetail: async (promptId: string) => {
    return fetchSeguro(`${API_URL}/public/prompt/${promptId}`);
  },

  getFeed: async (options?: { include_self?: boolean; cursor?: string | null }) => {
    const params = new URLSearchParams();
    if (options?.include_self) params.append("include_self", "true");
    if (options?.cursor) params.append("cursor", options.cursor);

    const queryString = params.toString() ? `?${params.toString()}` : "";

    return fetchSeguro(`${API_URL}/public/feed${queryString}`);
  },
};
