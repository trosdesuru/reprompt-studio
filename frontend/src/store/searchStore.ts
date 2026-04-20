import { create } from "zustand";

interface SearchState {
  query: string;
  results: any[];
  isLoading: boolean;
  nextCursor: string | null;
  hasMore: boolean;
  activeCategories: Record<string, boolean>;

  setQuery: (q: string) => void;
  setResults: (results: any[]) => void;
  appendResults: (newResults: any[], nextCursor: string | null) => void;
  setIsLoading: (loading: boolean) => void;
  toggleCategory: (categoryId: string) => void;
  clearSearch: () => void;
}

export const useSearchStore = create<SearchState>((set) => ({
  query: "",
  results: [],
  isLoading: false,
  nextCursor: null,
  hasMore: false,

  activeCategories: {
    midjourney: false,
    stablediffusion: false,
    comfyui: false,
    dalle: false,
  },

  setQuery: (query) => set({ query }),
  setResults: (results) => set({ results }),

  appendResults: (newResults, nextCursor) =>
    set((state) => {
      const combined = [...state.results, ...newResults];

      const unique = Array.from(new Map(combined.map((item) => [item.id, item])).values());

      return {
        results: unique,
        nextCursor: nextCursor,
        hasMore: !!nextCursor && unique.length > state.results.length,
      };
    }),

  setIsLoading: (isLoading) => set({ isLoading }),

  toggleCategory: (categoryId) =>
    set((state) => ({
      activeCategories: {
        ...state.activeCategories,
        [categoryId]: !state.activeCategories[categoryId],
      },
    })),

  clearSearch: () =>
    set({
      query: "",
      results: [],
      isLoading: false,
      nextCursor: null,
      hasMore: false,
    }),
}));
