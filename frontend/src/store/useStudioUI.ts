import { create } from "zustand";
import { fetchSeguro } from "../services/api/client";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";

export interface Directory {
  id: string;
  name: string;
  parent_id: string | null;
}

interface StudioUIState {
  directories: Directory[];
  activeDirectoryId: string | null;
  searchQuery: string;
  isSearching: boolean;

  setDirectories: (dirs: Directory[]) => void;
  setActiveDirectory: (id: string | null) => void;
  setSearchQuery: (query: string) => void;
  setIsSearching: (status: boolean) => void;

  getChildDirectories: (parentId: string | null) => Directory[];

  createDirectory: (name: string, parentId: string | null) => Promise<void>;
  deleteDirectory: (id: string) => Promise<void>;

  moveDirectory: (directoryId: string, newParentId: string | null) => Promise<void>;
}

export const useStudioUI = create<StudioUIState>((set, get) => ({
  directories: [],
  activeDirectoryId: null,
  searchQuery: "",
  isSearching: false,

  setDirectories: (directories) => set({ directories }),
  setActiveDirectory: (activeDirectoryId) => set({ activeDirectoryId }),
  setSearchQuery: (searchQuery) => set({ searchQuery }),
  setIsSearching: (isSearching) => set({ isSearching }),

  getChildDirectories: (parentId) => {
    return get().directories.filter((d: Directory) => d.parent_id === parentId);
  },

  createDirectory: async (name, parentId) => {
    try {
      const res = await fetchSeguro(`${API_URL}/directories/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, parent_id: parentId }),
        credentials: "include",
      });

      if (res.ok) {
        const newDir = await res.json();
        set((state) => ({ directories: [...state.directories, newDir] }));
      }
    } catch (error) {
      console.error("Error creando directorio:", error);
    }
  },

  deleteDirectory: async (id) => {
    try {
      const res = await fetchSeguro(`${API_URL}/directories/${id}`, {
        method: "DELETE",
        credentials: "include",
      });

      if (res.ok) {
        set((state) => ({
          directories: state.directories.filter((d) => d.id !== id),
          activeDirectoryId: state.activeDirectoryId === id ? null : state.activeDirectoryId,
        }));
      }
    } catch (error) {
      console.error("Error borrando directorio:", error);
    }
  },

  moveDirectory: async (directoryId, newParentId) => {
    set((state) => ({
      directories: state.directories.map((d) =>
        d.id === directoryId ? { ...d, parent_id: newParentId } : d,
      ),
    }));

    try {
      const res = await fetchSeguro(`${API_URL}/directories/${directoryId}/move`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ parent_id: newParentId }),
        credentials: "include",
      });

      if (!res.ok) throw new Error("Fallo al mover en el servidor");
    } catch (error) {
      console.error("Error moviendo directorio:", error);

      const res = await fetchSeguro(`${API_URL}/directories/`, {
        credentials: "include",
      });

      if (res.ok) {
        const data = await res.json();
        set({ directories: data });
      }
    }
  },
}));
