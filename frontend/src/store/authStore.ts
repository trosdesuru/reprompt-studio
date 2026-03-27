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
  isLoadingAuth: true, // Empieza en true hasta que el AuthProvider decida

  login: (userData) => set({ user: userData, isLoadingAuth: false }),

  // 🟢 Nueva Acción: El Logout seguro
  logout: async () => {
    try {
      // Llamamos al backend para que destruya la sesión en Redis y borre cookies
      await api.logout();
    } catch (error) {
      console.error("Error durante el logout:", error);
    } finally {
      // Pase lo que pase, lo borramos de la memoria del frontend
      set({ user: null });
      if (typeof window !== "undefined") {
        window.location.href = "/login";
      }
    }
  },

  // 🟢 Acción: Verificar al cargar la página
  checkAuth: async () => {
    set({ isLoadingAuth: true });
    try {
      const data = await api.obtenerPerfil();
      if (data.status === "success") {
        set({ user: { username: data.username, role: data.role }, isLoadingAuth: false });
      } else {
        set({ user: null, isLoadingAuth: false });
      }
    } catch (error) {
      // Si falla (ej. 401), el cliente de API intentará el refresco silencioso.
      // Si el refresco también falla, nos quedamos sin usuario.
      set({ user: null, isLoadingAuth: false });
    }
  },
}));
