"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { useAuthStore } from "@/src/store/authStore";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { checkAuth, user, isLoadingAuth } = useAuthStore();
  const pathname = usePathname() || "";

  useEffect(() => {
    console.log("🛡️ [AUTH_PROVIDER] Estado actual:", { user: user?.username, isLoadingAuth });
  }, [user, isLoadingAuth]);

  useEffect(() => {
    const isAuthPage = pathname.includes("/login") || pathname.includes("/join");

    if (!isAuthPage) {
      if (!user) {
        checkAuth();
      }
    } else {
      useAuthStore.setState({ isLoadingAuth: false });
    }
  }, [pathname, checkAuth, user]);

  return <>{children}</>;
}
