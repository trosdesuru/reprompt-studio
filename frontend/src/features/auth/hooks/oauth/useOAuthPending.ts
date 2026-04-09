import { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { api } from "@/src/services/api";
import toast from "react-hot-toast";

export function useOAuthPending() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [oauthPending, setOauthPending] = useState<any>(null);
  const [isOauthSubmitting, setIsOauthSubmitting] = useState(false);

  useEffect(() => {
    const pendingData = sessionStorage.getItem("oauth_pending");
    if (pendingData) {
      setOauthPending(JSON.parse(pendingData));
    }
  }, []);

  const handleOauthSubmit = async (inviteCode: string) => {
    if (!oauthPending) return;
    setIsOauthSubmitting(true);
    try {
      await api.registerGoogleUser({
        token: oauthPending.token,
        invite_code: inviteCode,
        username: oauthPending.username,
      });
      sessionStorage.removeItem("oauth_pending");
      toast.success("¡Cuenta VIP creada con éxito!");
      window.location.href = "/es/studio";
    } catch (error: any) {
      toast.error(error.message || "Código inválido");
    } finally {
      setIsOauthSubmitting(false);
    }
  };

  const cancelOauthFlow = () => {
    setOauthPending(null);
    sessionStorage.removeItem("oauth_pending");
    if (searchParams.get("step") === "oauth_invite") {
      router.replace("/es/login");
    }
  };

  return {
    oauthPending,
    isOauthSubmitting,
    handleOauthSubmit,
    cancelOauthFlow,
  };
}
