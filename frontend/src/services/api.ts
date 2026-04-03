import { authApi } from "./api/auth";
import { searchApi } from "./api/search";
import { downloadApi } from "./api/downloads";
import { promptApi } from "./api/prompts";
import { API_URL } from "./api/client";

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
      return Promise.reject(new Error("Ruta reeservada deel sistema"));
    }

    const res = await fetch(`${API_URL}/public/profile/${username}`);
    if (!res.ok) throw new Error("Perfil no encontrado");
    return res.json();
  },
  getPublicCollection: async (username: string, slug: string) => {
    if (RESERVED_ROUTES.has(username.toLowerCase())) {
      return Promise.reject(new Error("Ruta reservada del sistema"));
    }

    const res = await fetch(`${API_URL}/public/profile/${username}/${slug}`);
    if (!res.ok) throw new Error("Colección no encontrada");
    return res.json();
  },

  createCollection: async (data: { name: string; description?: string; is_private: boolean }) => {
    const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
    const res = await fetch(`${API_URL}/api/collections`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error("Error creando colección");
    return res.json();
  },

  getMyCollections: async () => {
    const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
    const res = await fetch(`${API_URL}/api/collections/`, { credentials: "include" });
    if (!res.ok) throw new Error("Error obteniendo colecciones");
    return res.json();
  },

  assignPromptToCollection: async (promptId: number, collectionId: number | null) => {
    const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
    const res = await fetch(`${API_URL}/api/collections/assign/${promptId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ collection_id: collectionId }),
    });
    if (!res.ok) throw new Error("Error asignando imagen");
    return res.json();
  },

  getPublicPromptDetail: async (promptId: string) => {
    const res = await fetch(`${API_URL}/public/prompt/${promptId}`);
    if (!res.ok) throw new Error("Imagen no encontrada o privada");
    return res.json();
  },

  getPublicFeed: async () => {
    const res = await fetch(`${API_URL}/public/feed`);
    const text = await res.text();

    try {
      const data = JSON.parse(text);
      if (!res.ok) throw new Error(data.detail || "Error del servidor");

      return data;
    } catch (e) {
      console.error("El servidor ha devuelto HTML o ha crasheado:", text);
      throw new Error("Error de conexión al cargar el feed público");
    }
  },
};
