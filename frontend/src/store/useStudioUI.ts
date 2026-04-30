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
  isSidebarOpen: boolean;

  refreshKey: number;
  triggerRefresh: () => void;
  toggleSidebar: () => void;

  setSidebarOpen: (val: boolean) => void;
  setDirectories: (dirs: Directory[]) => void;
  setActiveDirectory: (id: string | null) => void;
  setSearchQuery: (query: string) => void;
  setIsSearching: (status: boolean) => void;

  getChildDirectories: (parentId: string | null) => Directory[];
  getBreadcrumbs: () => Directory[];

  selectedPromptIds: string[];
  isSelectionMode: boolean;
  toggleSelectionMode: () => void;
  togglePromptSelection: (id: string) => void;
  clearSelection: () => void;
  selectAll: (ids: string[]) => void;
}

export const useStudioUI = create<StudioUIState>((set, get) => ({
  directories: [],
  activeDirectoryId: null,
  searchQuery: "",
  isSearching: false,
  isSidebarOpen: false,

  refreshKey: 0,
  triggerRefresh: () => set((state) => ({ refreshKey: state.refreshKey + 1 })),
  toggleSidebar: () => set((state) => ({ isSidebarOpen: !state.isSidebarOpen })),

  setSidebarOpen: (isOpen: boolean) => set({ isSidebarOpen: isOpen }),
  setDirectories: (directories) => set({ directories }),
  setActiveDirectory: (activeDirectoryId) => set({ activeDirectoryId }),
  setSearchQuery: (searchQuery) => set({ searchQuery }),
  setIsSearching: (isSearching) => set({ isSearching }),

  getChildDirectories: (parentId) => {
    return get().directories.filter((d: Directory) => d.parent_id === parentId);
  },

  getBreadcrumbs: () => {
    const { directories, activeDirectoryId } = get();
    const crumbs: Directory[] = [];
    let currentId = activeDirectoryId;

    while (currentId) {
      const dir = directories.find((d) => d.id === currentId);
      if (dir) {
        crumbs.unshift(dir);
        currentId = dir.parent_id;
      } else {
        currentId = null;
      }
    }
    return crumbs;
  },

  selectedPromptIds: [],
  isSelectionMode: false,

  toggleSelectionMode: () =>
    set((state) => {
      const newMode = !state.isSelectionMode;
      return {
        isSelectionMode: newMode,
        selectedPromptIds: newMode ? state.selectedPromptIds : [],
      };
    }),

  togglePromptSelection: (id: string) =>
    set((state) => {
      const isSelected = state.selectedPromptIds.includes(id);
      const newSelection = isSelected
        ? state.selectedPromptIds.filter((promptId) => promptId !== id)
        : [...state.selectedPromptIds, id];

      const shouldKeepMode = newSelection.length > 0;

      return {
        selectedPromptIds: newSelection,
        isSelectionMode: shouldKeepMode,
      };
    }),

  clearSelection: () => set({ selectedPromptIds: [], isSelectionMode: false }),

  selectAll: (ids: string[]) => set({ selectedPromptIds: ids, isSelectionMode: true }),
}));
