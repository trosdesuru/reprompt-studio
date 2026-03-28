// frontend/src/store/authStore.ts
import { create } from "zustand";
import { api } from "@/src/services/api";

interface User {
  username: string;
  role: string;
}

interface AuthState {
  user: User | null;
  isLoadingAuth: boolean;
  login: (userData: User) => void;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isLoadingAuth: true,

  login: (userData) => set({ user: userData, isLoadingAuth: false }),

  logout: async () => {
    try {
      await api.logout();
    } catch (error) {
      console.error("Error logout:", error);
    } finally {
      set({ user: null });
      if (typeof window !== "undefined") {
        window.location.href = "/login";
      }
    }
  },

  checkAuth: async () => {
    set({ isLoadingAuth: true });
    try {
      const data = await api.obtenerPerfil();

      // 🟢 FIX CRÍTICO: Comprobamos directamente si existe username,
      // ya que este endpoint NO devuelve "status: success"
      if (data && data.username) {
        set({ user: { username: data.username, role: data.role }, isLoadingAuth: false });
      } else {
        set({ user: null, isLoadingAuth: false });
      }
    } catch (error) {
      set({ user: null, isLoadingAuth: false });
    }
  },
}));
