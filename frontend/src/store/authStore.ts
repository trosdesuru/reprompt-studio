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

const redirectToLogin = () => {
  if (typeof window === "undefined") return;

  const currentPath = window.location.pathname;
  if (currentPath.includes("/login")) return;

  const localeMatch = currentPath.match(/^\/([a-z]{2})(?:\/|$)/);
  const localePrefix = localeMatch ? `/${localeMatch[1]}` : "";

  console.warn(`🚷 [AUTH_ROUTER] Redirigiendo al usuario a: ${localePrefix}/login`);
  window.location.href = `${localePrefix}/login`;
};

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isLoadingAuth: true,

  login: (userData) => {
    console.log(`[AUTH_STORE] Sesión iniciada localmente: @${userData.username}`);
    set({ user: userData, isLoadingAuth: false });
  },

  logoutSilencioso: () => {
    console.log("🤫 [AUTH_STORE] Limpieza de estado local (Silenciosa).");
    set({ user: null, isLoadingAuth: false });
  },

  checkAuth: async () => {
    console.log("🛡️ [AUTH_STORE] Consultando estado real al servidor...");
    set({ isLoadingAuth: true });

    try {
      const res = await api.me();
      const username = res?.username || res?.data?.username || res?.user?.username;
      const role = res?.role || res?.data?.role || res?.user?.role || "user";

      if (username) {
        console.log(`✅ [AUTH_STORE] checkAuth exitoso: @${username}`);
        set({ user: { username, role } });
      } else {
        console.warn("⚠️ [AUTH_STORE] checkAuth OK, pero sin 'username'.");
        set({ user: null });
      }
    } catch (error: unknown) {
      console.warn("🛑 [AUTH_STORE] checkAuth falló (No hay sesión activa).");
      try {
        handleError(error, "AuthStore");
      } catch (e) {}
      set({ user: null });
    } finally {
      set({ isLoadingAuth: false });
    }
  },

  logout: async () => {
    console.log("🧹 [AUTH_STORE] Ejecutando orden de desconexión API...");
    try {
      await api.logout();
      console.log("🧹 [AUTH_STORE] Backend confirmó destrucción de sesión.");
    } catch (error) {
      console.error("❌ [AUTH_STORE] Falló llamada al backend para logout:", error);
    } finally {
      set({ user: null, isLoadingAuth: false });
      redirectToLogin();
    }
  },
}));

if (typeof window !== "undefined") {
  console.log("🎧 [AUTH_STORE] Guardián de seguridad montado.");

  window.addEventListener("auth:unauthorized", () => {
    console.warn("🚨 [AUTH_STORE] ALERTA: Recibido evento 'auth:unauthorized'.");

    const state = useAuthStore.getState();

    if (state.user || state.isLoadingAuth) {
      state.logoutSilencioso();
      redirectToLogin();
    }
  });
}
