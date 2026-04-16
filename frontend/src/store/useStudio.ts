import { create } from "zustand";

export interface Directory {
  id: string;
  name: string;
  parent_id: string | null;
}

interface StudioState {
  directories: Directory[];
  activeDirectoryId: string | null;
  searchQuery: string;
  isSearching: boolean;

  setDirectories: (dirs: Directory[]) => void;
  setActiveDirectory: (id: string | null) => void;
  setSearchQuery: (query: string) => void;
  setIsSearching: (status: boolean) => void;

  getChildDirectories: (parentId: string | null) => Directory[];
}

export const useStudio = create<StudioState>((set, get) => ({
  directories: [],
  activeDirectoryId: null,
  searchQuery: "",
  isSearching: false,

  setDirectories: (directories) => set({ directories }),
  setActiveDirectory: (activeDirectoryId) => set({ activeDirectoryId }),
  setSearchQuery: (searchQuery) => set({ searchQuery }),
  setIsSearching: (isSearching) => set({ isSearching }),

  getChildDirectories: (parentId) => {
    return get().directories.filter((d) => d.parent_id === parentId);
  },
}));
