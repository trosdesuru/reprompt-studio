import { create } from "zustand";
import { api } from "@/src/services/api";
import { GalleryItem } from "@/src/types/gallery";
import { handleError } from "../utils/errors/ErrorHandler";

interface SearchState {
  query: string;
  results: GalleryItem[];
  isLoading: boolean;
  isLoadingMore: boolean;
  error: string | null;
  nextCursor: string | null;
  hasMore: boolean;
  activeCategories: Record<string, boolean>;
  
  setQuery: (q: string) => void;
  toggleCategory: (id: string) => void;
  executeSearch: () => Promise<void>;
  loadMore: () => Promise<void>;
  trending: GalleryItem[];
  fetchTrending: () => Promise<void>;
}

export const useSearchStore = create<SearchState>((set, get) => ({
  query: "",
  results: [],
  trending: [],
  isLoading: false,
  isLoadingMore: false,
  error: null,
  nextCursor: null,
  hasMore: false,
  activeCategories: {
    misc: false, doujinshi: true, manga: false, artistcg: false, gamecg: false,
    western: false, nonh: false, imageset: false, cosplay: false, asianporn: false,
  },

  setQuery: (q) => set({ query: q }),
  
  toggleCategory: (id) =>
    set((state) => ({
      activeCategories: { ...state.activeCategories, [id]: !state.activeCategories[id] },
    })),

  executeSearch: async () => {
    const { query, activeCategories } = get();
    if (!query) return;
    
    set({ isLoading: true, error: null, results: [], nextCursor: null, hasMore: true });

    try {
      const data = await api.buscar(query, null, activeCategories);
      if (process.env.NODE_ENV === "development") console.log("🚨 TELEMETRÍA [API INITIAL SEARCH]:", data);

      if (data.status === "success") {
        set({
          results: data.data || [],
          nextCursor: data.next_id || null,
          hasMore: !!data.next_id,
        });
      }
    } catch (err: unknown) {
      const cleanMessage = handleError(err, "SearchStore");
      set({ error: cleanMessage });
    } finally {
      set({ isLoading: false });
    }
  },

  // ✅ AQUÍ ESTÁ EL CÓDIGO REAL RESTAURADO
  loadMore: async () => {
    const { query, nextCursor, hasMore, isLoadingMore, activeCategories, results } = get();
    
    if (process.env.NODE_ENV === "development") console.log("🚨 TELEMETRÍA [STORE]: Ejecutando loadMore. Estado actual:", { isLoadingMore, hasMore, nextCursor });

    // Bloqueamos si ya está cargando o no hay más páginas
    if (isLoadingMore || !hasMore || !nextCursor) {
      if (process.env.NODE_ENV === "development") console.warn("🚨 TELEMETRÍA [STORE]: Petición bloqueada (ya cargando o sin cursor).");
      return;
    }
    
    set({ isLoadingMore: true });

    try {
      console.log(`🚨 TELEMETRÍA [STORE]: Pidiendo página con cursor: ${nextCursor}`);
      const data = await api.buscar(query, nextCursor, activeCategories);
      
      if (process.env.NODE_ENV === "development") console.log("🚨 TELEMETRÍA [API LOAD MORE]:", data);

      if (data.status === "success" && data.data && data.data.length > 0) {
        const combined = [...results, ...data.data];
        
        // Filtramos duplicados usando la URL como ID único
        const unique = Array.from(new Map(combined.map((item) => [item.url, item])).values());

        // 🛡️ CIRCUIT BREAKER
        if (unique.length === results.length) {
          if (process.env.NODE_ENV === "development") console.warn("🚨 CIRCUIT BREAKER: El Backend mandó los mismos resultados. Cortando el bucle.");
          set({ hasMore: false });
        } else {
          set({
            results: unique,
            nextCursor: data.next_id || null,
            hasMore: !!data.next_id, // Si no hay next_id, desactivamos el Infinite Scroll
          });
        }
      } else {
        if (process.env.NODE_ENV === "development") console.warn("🚨 TELEMETRÍA [STORE]: La API devolvió un array vacío. Fin de los resultados.");
        set({ hasMore: false });
      }
    } catch (err) {
      if (process.env.NODE_ENV === "development") console.error("🚨 TELEMETRÍA [STORE]: Error al cargar más:", err);
    } finally {
      set({ isLoadingMore: false });
    }
  },

  // ✅ CÓDIGO RESTAURADO PARA LAS TENDENCIAS DE LA HOME
  fetchTrending: async () => {
    try {
      const data = await api.obtenerTendencias(5);
      if (data.status === "success") set({ trending: data.data });
    } catch (err) {
      console.error("Error cargando tendencias:", err);
    }
  },
}));
