import { create } from "zustand";
import { api } from "@/src/services/api";

interface AuthState {
  user: { username: string; role: string } | null;
  isLoadingAuth: boolean;
  checkAuth: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isLoadingAuth: true,
  checkAuth: async () => {
    try {
      const data = await api.obtenerPerfil();
      set({ user: data.user, isLoadingAuth: false });
    } catch (error) {
      set({ user: null, isLoadingAuth: false });
    }
  },
}));
