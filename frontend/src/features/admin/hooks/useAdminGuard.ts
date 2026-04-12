import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/src/store/authStore";

export function useAdminGuard() {
  const { user, isLoadingAuth } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    if (!isLoadingAuth && (!user || user.role !== "admin")) {
      router.push("/");
    }
  }, [user, isLoadingAuth, router]);

  const isAuthorized = !isLoadingAuth && user?.role === "admin";

  return { user, isLoadingAuth, isAuthorized };
}
