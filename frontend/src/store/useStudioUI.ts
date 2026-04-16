import { create } from "zustand";

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

  // Acciones de Estado
  setDirectories: (dirs: Directory[]) => void;
  setActiveDirectory: (id: string | null) => void;
  setSearchQuery: (query: string) => void;
  setIsSearching: (status: boolean) => void;

  // Utilidades
  getChildDirectories: (parentId: string | null) => Directory[];

  // Acciones de API (CRUD)
  createDirectory: (name: string, parentId: string | null) => Promise<void>;
  deleteDirectory: (id: string) => Promise<void>;
  // 🟢 NUEVO: Función para mover carpetas
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
      const res = await fetch("/api/directories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, parent_id: parentId }),
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
      const res = await fetch(`/api/directories/${id}`, { method: "DELETE" });
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

  // 🟢 NUEVA LÓGICA: Mover Directorio
  moveDirectory: async (directoryId, newParentId) => {
    // 1. Actualización optimista (UI instantánea)
    set((state) => ({
      directories: state.directories.map((d) =>
        d.id === directoryId ? { ...d, parent_id: newParentId } : d,
      ),
    }));

    try {
      // 2. Confirmación con el backend
      const res = await fetch(`/api/directories/${directoryId}/move`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ parent_id: newParentId }),
      });

      if (!res.ok) throw new Error("Fallo al mover en el servidor");
    } catch (error) {
      console.error("Error moviendo directorio:", error);
      // 3. Rollback si el backend falla
      const res = await fetch("/api/directories");
      if (res.ok) {
        const data = await res.json();
        set({ directories: data });
      }
    }
  },
}));
