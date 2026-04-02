import { authApi } from "./api/auth";
import { searchApi } from "./api/search";
import { downloadApi } from "./api/downloads";
import { promptApi } from "./api/prompts";
import { API_URL } from "./api/client";

export const api = {
  ...authApi,
  ...searchApi,
  ...downloadApi,
  ...promptApi,

  getPublicProfile: async (username: string) => {
    const res = await fetch(`${API_URL}/public/profile/${username}`);
    if (!res.ok) throw new Error("Perfil no encontrado");
    return res.json();
  },
  getPublicCollection: async (username: string, slug: string) => {
    const res = await fetch(`${API_URL}/public/profile/${username}/${slug}`);
    if (!res.ok) throw new Error("Colección no encontrada");
    return res.json();
  },
};
