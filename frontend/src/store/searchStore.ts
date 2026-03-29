// frontend/src/store/searchStore.ts
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

  // Acciones
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
    misc: true,
    doujinshi: true,
    manga: true,
    artistcg: true,
    gamecg: true,
    western: true,
    nonh: true,
    imageset: true,
    cosplay: true,
    asianporn: true,
  },

  setQuery: (q) => set({ query: q }),

  toggleCategory: (id) =>
    set((state) => ({
      activeCategories: {
        ...state.activeCategories,
        [id]: !state.activeCategories[id],
      },
    })),

  executeSearch: async () => {
    const { query, activeCategories } = get();
    if (!query) return;

    set({ isLoading: true, error: null, results: [], nextCursor: null, hasMore: true });

    try {
      const data = await api.buscar(query, null, activeCategories);
      if (data.status === "success") {
        set({
          results: data.data,
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

  loadMore: async () => {
    const { query, nextCursor, hasMore, isLoadingMore, activeCategories, results } = get();
    if (isLoadingMore || !hasMore || !nextCursor) return;

    set({ isLoadingMore: true });

    try {
      const data = await api.buscar(query, nextCursor, activeCategories);
      if (data.status === "success" && data.data.length > 0) {
        // Evitamos duplicados con un Map
        const combined = [...results, ...data.data];
        const unique = Array.from(new Map(combined.map((item) => [item.url, item])).values());

        set({
          results: unique,
          nextCursor: data.next_id || null,
          hasMore: !!data.next_id,
        });
      } else {
        set({ hasMore: false });
      }
    } catch (err) {
      console.error("Error al cargar más:", err);
    } finally {
      set({ isLoadingMore: false });
    }
  },

  fetchTrending: async () => {
    try {
      const data = await api.obtenerTendencias(5); // Pedimos el Top 5
      if (data.status === "success") {
        set({ trending: data.data });
      }
    } catch (err) {
      console.error("Error cargando tendencias:", err);
    }
  },
}));
