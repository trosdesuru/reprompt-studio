import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/src/store/authStore";

export function useRedirectIfAuthenticated(redirectTo: string = "/") {
  const router = useRouter();
  const { user, isLoadingAuth } = useAuthStore();

  useEffect(() => {
    if (!isLoadingAuth && user) {
      router.replace(redirectTo);
    }
  }, [user, isLoadingAuth, router, redirectTo]);

  return {
    isChecking: isLoadingAuth,
    isAuthenticated: !!user,
  };
}
