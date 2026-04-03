import { create } from "zustand";
import { api } from "@/src/services/api";
import { handleError } from "../utils/errors/ErrorHandler";

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
  logoutSilencioso: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isLoadingAuth: true,

  login: (userData) => set({ user: userData, isLoadingAuth: false }),

  logoutSilencioso: () => {
    console.log("🤫 [AUTH_STORE] Ejecutando limpieza de estado en memoria.");
    set({ user: null, isLoadingAuth: false });
  },

  logout: async () => {
    try {
      await api.logout();
    } catch (error) {
      console.error("Error logout:", error);
    } finally {
      set({ user: null });
      if (typeof window !== "undefined") {
        const currentPath = window.location.pathname;
        const localeMatch = currentPath.match(/^\/([a-z]{2})(?:\/|$)/);
        const localePrefix = localeMatch ? `/${localeMatch[1]}` : "";

        window.location.href = `${localePrefix}/login`;
      }
    }
  },

  checkAuth: async () => {
    set({ isLoadingAuth: true });
    try {
      const res = await api.obtenerPerfil();

      const username = res?.username || res?.data?.username || res?.user?.username;
      const role = res?.role || res?.data?.role || res?.user?.role || "user";

      if (username) {
        set({ user: { username, role } });
      } else {
        console.warn("⚠️ QA [authStore] 200 OK pero JSON no tiene 'username':", res);
        set({ user: null });
      }
    } catch (error: unknown) {
      console.warn("🛑 [AUTH_STORE] CheckAuth falló (Probable 401).");
      try {
        handleError(error, "AuthStore");
      } catch (e) {
        console.error("Error interno en handleError:", e);
      }
      set({ user: null });
    } finally {
      set({ isLoadingAuth: false });
    }
  },
}));

if (typeof window !== "undefined") {
  window.addEventListener("auth:unauthorized", () => {
    const state = useAuthStore.getState();

    if (state.user || state.isLoadingAuth) {
      state.logoutSilencioso();

      if (!window.location.pathname.includes("/login")) {
        console.warn("🚷 [SECURITY_ACTION] Interceptado 401. Expulsando a /login...");
        const localeMatch = window.location.pathname.match(/^\/([a-z]{2})(?:\/|$)/);
        const localePrefix = localeMatch ? `/${localeMatch[1]}` : "";
        window.location.href = `${localePrefix}/login`;
      }
    }
  });
}
