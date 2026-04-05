import { authApi } from "./api/auth";
import { searchApi } from "./api/search";
import { downloadApi } from "./api/downloads";
import { promptApi } from "./api/prompts";
import { API_URL, fetchSeguro } from "./api/client";

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

export const api = {
  ...authApi,
  ...searchApi,
  ...downloadApi,
  ...promptApi,

  getPublicProfile: async (username: string) => {
    if (RESERVED_ROUTES.has(username.toLowerCase())) {
      return Promise.reject(new Error("Ruta reservada del sistema"));
    }
    return fetchSeguro(`${API_URL}/public/profile/${username}`);
  },

  getPublicCollection: async (username: string, slug: string) => {
    if (RESERVED_ROUTES.has(username.toLowerCase())) {
      return Promise.reject(new Error("Ruta reservada del sistema"));
    }
    return fetchSeguro(`${API_URL}/public/profile/${username}/${slug}`);
  },

  getPublicPromptDetail: async (promptId: string) => {
    return fetchSeguro(`${API_URL}/public/prompt/${promptId}`);
  },

  getPublicFeed: async (options?: { include_self?: boolean }) => {
    const queryString = options?.include_self ? "?include_self=true" : "";
    return fetchSeguro(`${API_URL}/public/feed${queryString}`);
  },

  createCollection: async (data: { name: string; description?: string; is_private: boolean }) => {
    return fetchSeguro(`${API_URL}/collections`, {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  getMyCollections: async () => {
    return fetchSeguro(`${API_URL}/collections/`);
  },

  assignPromptToCollection: async (promptId: number, collectionId: number | null) => {
    return fetchSeguro(`${API_URL}/collections/assign/${promptId}`, {
      method: "PUT",
      body: JSON.stringify({ collection_id: collectionId }),
    });
  },

  verifyGoogleCode: async (data: { code: string }) => {
    return fetchSeguro(`${API_URL}/auth/google/join`, {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  getGoogleAuthUrl: async () => {
    return fetchSeguro(`${API_URL}/auth/google`, {
      method: "POST",
    });
  },
};
