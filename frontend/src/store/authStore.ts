import { create } from "zustand";
import { api } from "@/src/services/api";

interface User {
  username: string;
  role: string;
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean; // 🟢 FIX: Añadido al contrato
  isLoadingAuth: boolean;
  login: (userData: User) => void;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;
  logoutSilencioso: () => void;
}

const redirectToLogin = () => {
  if (typeof window === "undefined") return;

  const currentPath = window.location.pathname;
  if (
    currentPath.includes("/login") ||
    currentPath.includes("/google/callback") ||
    currentPath.includes("/discord/callback")
  ) {
    return;
  }

  const localeMatch = currentPath.match(/^\/([a-z]{2})(?:\/|$)/);
  const localePrefix = localeMatch ? `/${localeMatch[1]}` : "";

  console.warn(`🚷 [AUTH_ROUTER] Redirigiendo al usuario a: ${localePrefix}/login`);
  window.location.href = `${localePrefix}/login`;
};

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false, // 🟢 FIX: Inicializado
  isLoadingAuth: true,

  login: (userData) => {
    console.log(`[AUTH_STORE] Sesión iniciada localmente: @${userData.username}`);
    set({ user: userData, isAuthenticated: true, isLoadingAuth: false });
  },

  logoutSilencioso: () => {
    console.log("🤫 [AUTH_STORE] Limpieza de estado local (Silenciosa).");
    set({ user: null, isAuthenticated: false, isLoadingAuth: false });
  },

  checkAuth: async () => {
    console.log("🔍 [AUTH_STORE] Verificando estado de sesión...");
    set({ isLoadingAuth: true });

    try {
      // 🟢 FIX: Consolidado en una sola llamada y con AWAIT
      const res = await api.auth.me(); 
      
      // Mapeo defensivo de la respuesta del backend
      const userData = res?.user || res?.data || res;
      const username = userData?.username;
      const role = userData?.role || "voyager";

      if (username) {
        console.log(`✅ [AUTH_STORE] checkAuth exitoso: @${username}`);
        set({ 
          user: { username, role }, 
          isAuthenticated: true, 
          isLoadingAuth: false 
        });
      } else {
        console.warn("⚠️ [AUTH_STORE] checkAuth respondió OK pero el cuerpo está vacío.");
        set({ user: null, isAuthenticated: false, isLoadingAuth: false });
      }
    } catch (error: unknown) {
      console.warn("🛑 [AUTH_STORE] checkAuth falló (No hay sesión activa).");
      set({ user: null, isAuthenticated: false, isLoadingAuth: false });
      
      // No lanzamos el error al ErrorHandler aquí para evitar spam de toasts en el login
    } finally {
      set({ isLoadingAuth: false });
    }
  },

  logout: async () => {
    console.log("扫 [AUTH_STORE] Ejecutando orden de desconexión API...");
    try {
      await api.auth.logout();
      console.log("🧹 [AUTH_STORE] Backend confirmó destrucción de sesión.");
    } catch (error) {
      console.error("❌ [AUTH_STORE] Falló llamada al backend para logout:", error);
    } finally {
      set({ user: null, isAuthenticated: false, isLoadingAuth: false });
      redirectToLogin();
    }
  },
}));

// Escuchador de eventos globales para expulsión inmediata
if (typeof window !== "undefined") {
  window.addEventListener("auth:unauthorized", () => {
    console.warn("🚨 [AUTH_STORE] ALERTA: Recibido evento 'auth:unauthorized'.");
    const state = useAuthStore.getState();
    if (state.isAuthenticated || state.user) {
      state.logoutSilencioso();
      redirectToLogin();
    }
  });
}