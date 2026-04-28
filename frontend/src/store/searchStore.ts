import { create } from "zustand";

interface SearchState {
  query: string;
  results: any[];
  isLoading: boolean;
  isLoadingMore: boolean;
  nextCursor: string | null;
  hasMore: boolean;
  error: string | null;
  activeCategories: Record<string, boolean>;

  setQuery: (q: string) => void;
  setResults: (results: any[], nextCursor?: string | null) => void;
  appendResults: (newResults: any[], nextCursor: string | null) => void;
  setIsLoading: (loading: boolean) => void;
  setIsLoadingMore: (loading: boolean) => void;
  setError: (error: string | null) => void;
  toggleCategory: (categoryId: string) => void;
  clearSearch: () => void;
}

export const useSearchStore = create<SearchState>((set) => ({
  query: "",
  results: [],
  isLoading: false,
  isLoadingMore: false,
  nextCursor: null,
  hasMore: false,
  error: null,

  activeCategories: {
    midjourney: false,
    stablediffusion: false,
    comfyui: false,
    dalle: false,
  },

  setQuery: (query) => set({ query }),

  setResults: (results, nextCursor = null) => set({ results, nextCursor, hasMore: !!nextCursor }),

  appendResults: (newResults, nextCursor) =>
    set((state) => {
      const combined = [...state.results, ...newResults];
      const unique = Array.from(new Map(combined.map((item) => [item.id, item])).values());

      return {
        results: unique,
        nextCursor: nextCursor,
        hasMore: !!nextCursor,
      };
    }),

  setIsLoading: (isLoading) => set({ isLoading }),
  setIsLoadingMore: (isLoadingMore) => set({ isLoadingMore }),
  setError: (error) => set({ error }),

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
      isLoadingMore: false,
      nextCursor: null,
      hasMore: false,
      error: null,
    }),
}));
