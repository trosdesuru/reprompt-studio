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
      const res = await api.obtenerPerfil();

      // 🟢 CHIVATO QA: Veremos exactamente qué envía el Backend
      console.log("🕵️‍♂️ QA [authStore] Respuesta Backend:", res);

      // 🛡️ PROGRAMACIÓN DEFENSIVA: Extraemos los datos sin importar la envoltura
      const username = res?.username || res?.data?.username || res?.user?.username;
      const role = res?.role || res?.data?.role || res?.user?.role || "user";

      if (username) {
        console.log(`✅ QA [authStore] Usuario detectado: ${username} (${role})`);
        set({ user: { username, role }, isLoadingAuth: false });
      } else {
        console.warn("⚠️ QA [authStore] 200 OK pero JSON no tiene 'username':", res);
        set({ user: null, isLoadingAuth: false });
      }
    } catch (error) {
      console.error("❌ QA [authStore] Fallo de red o Sesión Caducada:", error);
      set({ user: null, isLoadingAuth: false });
    }
  },
}));
