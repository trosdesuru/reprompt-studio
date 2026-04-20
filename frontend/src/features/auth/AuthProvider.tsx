"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { useAuthStore } from "@/src/store/authStore";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { checkAuth, user, hasCheckedInitialAuth } = useAuthStore();
  const pathname = usePathname() || "";

  useEffect(() => {
    const isAuthPage =
      pathname.includes("/login") || pathname.includes("/join") || pathname.includes("/callback");

    if (!isAuthPage) {
      if (!user && !hasCheckedInitialAuth) {
        checkAuth();
      }
    } else {
      useAuthStore.setState({ isLoadingAuth: false });
    }
  }, [pathname, checkAuth, user, hasCheckedInitialAuth]);

  return <>{children}</>;
}
