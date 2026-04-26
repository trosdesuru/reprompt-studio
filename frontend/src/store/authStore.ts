import { create } from "zustand";
import { api } from "@/src/services/api";

export interface User {
  username: string;
  role: string;
  id?: string | number;
  avatarUrl?: string | null;
  fullName?: string | null;
  profession?: string | null;
  age?: number;
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoadingAuth: boolean;
  hasCheckedInitialAuth: boolean;
  updateUser: (data: Partial<User>) => void;
  updateLocalUsername: (newUsername: string) => void;

  login: (userData: User) => void;
  logout: () => Promise<void>;
  checkAuth: (force?: boolean) => Promise<void>;
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

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  isAuthenticated: false,
  isLoadingAuth: true,
  hasCheckedInitialAuth: false,
  updateLocalUsername: (newUsername) => {
    const currentUser = get().user;
    if (currentUser) {
      set({ user: { ...currentUser, username: newUsername } });
    }
  },
  updateUser: (data: any) =>
    set((state) => ({
      user: state.user ? { ...state.user, ...data } : null,
    })),

  login: (userData) => {
    console.log(`[AUTH_STORE] Sesión iniciada localmente: @${userData.username}`);
    set({
      user: userData,
      isAuthenticated: true,
      isLoadingAuth: false,
      hasCheckedInitialAuth: true,
    });
  },

  logoutSilencioso: () => {
    console.log("🤫 [AUTH_STORE] Limpieza de estado local (Silenciosa).");
    set({ user: null, isAuthenticated: false, isLoadingAuth: false, hasCheckedInitialAuth: true });
  },

  checkAuth: async (force = false) => {
    const { hasCheckedInitialAuth } = get();

    if (hasCheckedInitialAuth && !force) {
      return;
    }

    console.log("🔍 [AUTH_STORE] Verificando estado de sesión...");
    set({ isLoadingAuth: true });

    try {
      const res = await api.auth.me();

      const userData = res?.user || res?.data || res;
      const username = userData?.username;
      const role = userData?.role || "voyager";

      if (username) {
        console.log(`✅ [AUTH_STORE] checkAuth exitoso: @${username}`);
        set({
          user: {
            ...userData,
            username,
            role,
            avatarUrl: userData?.avatar_url || userData?.avatarUrl,
          },
          isAuthenticated: true,
        });
      } else {
        console.warn("⚠️ [AUTH_STORE] checkAuth respondió OK pero el cuerpo está vacío.");
        set({ user: null, isAuthenticated: false });
      }
    } catch (error: unknown) {
      console.warn("🛑 [AUTH_STORE] checkAuth falló (No hay sesión activa).");
      set({ user: null, isAuthenticated: false });
    } finally {
      set({ isLoadingAuth: false, hasCheckedInitialAuth: true });
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
      set({
        user: null,
        isAuthenticated: false,
        isLoadingAuth: false,
        hasCheckedInitialAuth: true,
      });
      redirectToLogin();
    }
  },
}));

if (typeof window !== "undefined") {
  window.addEventListener("auth:session_recovered", () => {
    console.log("♻️ [AUTH_STORE] Sesión recuperada. Sincronizando interfaz...");
    useAuthStore.getState().checkAuth(true);
  });

  window.addEventListener("auth:unauthorized", () => {
    const state = useAuthStore.getState();
    if (state.isAuthenticated) {
      state.logoutSilencioso();
      const currentPath = window.location.pathname;
      if (!currentPath.includes("/login")) {
        window.location.href = `/${currentPath.split("/")[1] || "es"}/login`;
      }
    }
  });
}
