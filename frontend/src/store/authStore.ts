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

  login: (userData) => {
    console.log(`🟢 [AUTH_STORE] Sesión iniciada en estado local para: @${userData.username}`);
    set({ user: userData, isLoadingAuth: false });
  },

  logoutSilencioso: () => {
    console.log(
      "🤫 [AUTH_STORE] Ejecutando limpieza de estado local en memoria (Sin avisar al backend).",
    );
    set({ user: null, isLoadingAuth: false });
  },

  checkAuth: async () => {
    console.log("🛡️ [AUTH_STORE] Iniciando checkAuth(). Consultando estado real al servidor...");
    set({ isLoadingAuth: true });

    try {
      const res = await api.obtenerPerfil();

      const username = res?.username || res?.data?.username || res?.user?.username;
      const role = res?.role || res?.data?.role || res?.user?.role || "user";

      if (username) {
        console.log(
          `✅ [AUTH_STORE] checkAuth exitoso. Usuario validado por el backend: @${username}`,
        );
        set({ user: { username, role } });
      } else {
        console.warn(
          "⚠️ [AUTH_STORE] checkAuth devolvió OK, pero el JSON no contiene el 'username'.",
          res,
        );
        set({ user: null });
      }
    } catch (error: unknown) {
      console.warn(
        "🛑 [AUTH_STORE] checkAuth falló. Esto es normal si no hay sesión o si el Access Token expiró.",
      );
      try {
        handleError(error, "AuthStore");
      } catch (e) {
        // Silenciamos este error interno para no ensuciar los logs
      }
      set({ user: null });
    } finally {
      set({ isLoadingAuth: false });
    }
  },

  logout: async () => {
    console.log("🧹 [AUTH_STORE] Ejecutando orden de desconexión completa (Logout API)...");
    try {
      await api.logout();
      console.log("🧹 [AUTH_STORE] El backend ha confirmado la destrucción de cookies y sesión.");
    } catch (error) {
      console.error("❌ [AUTH_STORE] Falló la llamada al backend para hacer logout:", error);
    } finally {
      set({ user: null, isLoadingAuth: false });

      if (typeof window !== "undefined") {
        const currentPath = window.location.pathname;
        const localeMatch = currentPath.match(/^\/([a-z]{2})(?:\/|$)/);
        const localePrefix = localeMatch ? `/${localeMatch[1]}` : "";

        console.log(`🧹 [AUTH_STORE] Redirigiendo al usuario a: ${localePrefix}/login`);
        window.location.href = `${localePrefix}/login`;
      }
    }
  },
}));

// ==============================================================================
// 🛡️ GUARDIÁN GLOBAL: LISTENER DE EVENTOS (Ahora sí funciona 24/7)
// ==============================================================================
if (typeof window !== "undefined") {
  console.log("🎧 [AUTH_STORE] Guardián de seguridad (Listener 'auth:unauthorized') montado.");

  window.addEventListener("auth:unauthorized", () => {
    console.warn(
      "🚨 [AUTH_STORE] ALERTA DE SISTEMA: Recibido evento 'auth:unauthorized'. La sesión ha muerto irrecuperablemente.",
    );

    const state = useAuthStore.getState();

    if (state.user || state.isLoadingAuth) {
      // Limpiamos la memoria
      state.logoutSilencioso();

      if (!window.location.pathname.includes("/login")) {
        console.warn("🚷 [AUTH_STORE] Expulsando al usuario a /login...");
        const localeMatch = window.location.pathname.match(/^\/([a-z]{2})(?:\/|$)/);
        const localePrefix = localeMatch ? `/${localeMatch[1]}` : "";

        window.location.href = `${localePrefix}/login`;
      }
    }
  });
}
