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

  getFeed: async (options?: { include_self?: boolean }) => {
    const queryString = options?.include_self ? "?include_self=true" : "";
    return fetchSeguro(`${API_URL}/public/feed${queryString}`);
  },
};
