"use client";

import { useEffect } from "react";
import { useAuthStore } from "@/src/store/authStore";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { checkAuth } = useAuthStore();

  useEffect(() => {
    if (typeof window !== "undefined") {
      const isAuthPage =
        window.location.pathname.includes("/login") || window.location.pathname.includes("/join");

      if (!isAuthPage) {
        checkAuth();
      } else {
        useAuthStore.setState({ isLoadingAuth: false });
      }
    }
  }, [checkAuth]);

  return <>{children}</>;
}