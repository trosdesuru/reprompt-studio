import { create } from "zustand";
import { api } from "@/src/services/api";
import { GalleryItem } from "@/src/types/gallery";
import { handleError } from "../utils/errors/ErrorHandler";

interface SearchState {
  query: string; results: GalleryItem[]; isLoading: boolean; isLoadingMore: boolean; error: string | null; nextCursor: string | null; hasMore: boolean; activeCategories: Record<string, boolean>;
  setQuery: (q: string) => void; toggleCategory: (id: string) => void; executeSearch: () => Promise<void>; loadMore: () => Promise<void>; trending: GalleryItem[]; fetchTrending: () => Promise<void>;
}

export const useSearchStore = create<SearchState>((set, get) => ({
  query: "", results: [], trending: [], isLoading: false, isLoadingMore: false, error: null, nextCursor: null, hasMore: false,
  activeCategories: { misc: false, doujinshi: true, manga: false, artistcg: false, gamecg: false, western: false, nonh: false, imageset: false, cosplay: false, asianporn: false },
  
  setQuery: (q) => set({ query: q }),
  toggleCategory: (id) => set((state) => ({ activeCategories: { ...state.activeCategories, [id]: !state.activeCategories[id] } })),

  executeSearch: async () => {
    const { query, activeCategories } = get();
    if (!query) return;
    
    set({ isLoading: true, error: null, results: [], nextCursor: null, hasMore: true });

    try {
      const data = await api.buscar(query, null, activeCategories);
      
      // 🚨 SENSOR DE API (El más importante)
      console.log("🚨 TELEMETRÍA [API RESPONSE RAW]:", data);

      if (data.status === "success") {
        set({
          results: data.data || [],
          nextCursor: data.next_id || null,
          hasMore: !!data.next_id,
        });
      } else {
        console.warn("🚨 TELEMETRÍA [API FALLÓ SILENCIOSAMENTE]:", data);
      }
    } catch (err: unknown) {
      console.error("🚨 TELEMETRÍA [API CATCH ERROR]:", err);
      const cleanMessage = handleError(err, "SearchStore");
      set({ error: cleanMessage });
    } finally {
      set({ isLoading: false });
    }
  },

  loadMore: async () => { /* Mantengo tu Circuit Breaker intacto aquí... */ },
  fetchTrending: async () => { /* ... */ },
}));
