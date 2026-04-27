import { create } from "zustand";

export interface Directory {
  id: string;
  name: string;
  parent_id: string | null;
  slug?: string;
  is_private?: boolean;
}

interface StudioUIState {
  directories: Directory[];
  activeDirectoryId: string | null;

  searchQuery: string;
  isSearching: boolean;

  refreshKey: number;
  triggerRefresh: () => void;

  setDirectories: (dirs: Directory[]) => void;
  setActiveDirectory: (id: string | null) => void;
  setSearchQuery: (query: string) => void;
  setIsSearching: (status: boolean) => void;

  getChildDirectories: (parentId: string | null) => Directory[];
}

export const useStudioUI = create<StudioUIState>((set, get) => ({
  directories: [],
  activeDirectoryId: null,
  searchQuery: "",
  isSearching: false,

  refreshKey: 0,
  triggerRefresh: () => set((state) => ({ refreshKey: state.refreshKey + 1 })),

  setDirectories: (directories) => set({ directories }),
  setActiveDirectory: (activeDirectoryId) => set({ activeDirectoryId }),
  setSearchQuery: (searchQuery) => set({ searchQuery }),
  setIsSearching: (isSearching) => set({ isSearching }),

  getChildDirectories: (parentId) => {
    return get().directories.filter((d: Directory) => d.parent_id === parentId);
  },
}));
