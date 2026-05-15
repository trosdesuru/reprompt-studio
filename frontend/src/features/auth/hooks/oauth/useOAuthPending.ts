import { useState, useEffect } from "react";
import { useSearchParams, useRouter, useParams } from "next/navigation";
import { api } from "@/src/services/api";
import toast from "react-hot-toast";

export function useOAuthPending() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [oauthPending, setOauthPending] = useState<any>(null);
  const [isOauthSubmitting, setIsOauthSubmitting] = useState(false);

  const params = useParams();
  const lang = (params?.lang as string) || "es";

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
      await api.auth.registerGoogleUser({
        token: oauthPending.token,
        invite_code: inviteCode,
        username: oauthPending.username,
      });
      sessionStorage.removeItem("oauth_pending");
      toast.success("¡Cuenta VOYAGER creada con éxito!");
      globalThis.location.href = `${lang}/studio`;
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
