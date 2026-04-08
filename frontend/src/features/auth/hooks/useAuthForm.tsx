// src/features/auth/hooks/useAuthForm.ts
import { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { api } from "@/src/services/api";
import toast from "react-hot-toast";

export function useAuthForm() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [isLogin, setIsLogin] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [oauthPending, setOauthPending] = useState<any>(null);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [isDiscordLoading, setIsDiscordLoading] = useState(false);

  const [emailOrUser, setEmailOrUser] = useState("");
  const [password, setPassword] = useState("");
  const [inviteCode, setInviteCode] = useState("");
  const [isInviteLocked, setIsInviteLocked] = useState(false);

  useEffect(() => {
    const pendingData = sessionStorage.getItem("oauth_pending");
    if (pendingData) {
      setOauthPending(JSON.parse(pendingData));
      return;
    }

    const codeFromUrl = searchParams.get("code");
    if (codeFromUrl) {
      setIsLogin(false);
      setInviteCode(codeFromUrl);
      setIsInviteLocked(true);
    }
  }, [searchParams]);

  const handleOauthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await api.registerGoogleUser({
        token: oauthPending.token,
        invite_code: inviteCode,
        username: oauthPending.username,
      });
      sessionStorage.removeItem("oauth_pending");
      toast.success("¡Cuenta VIP creada con éxito!");
      window.location.href = "/es/studio"; // Recarga dura obligatoria
    } catch (error: any) {
      toast.error(error.message || "Código inválido");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (isLogin) {
        await api.login({ username: emailOrUser, password });
        toast.success("¡Bienvenido de nuevo!");
        router.push("/es/studio");
      } else {
        await api.register({
          email: emailOrUser,
          password,
          invite_code: inviteCode,
        });
        toast.success("Cuenta creada con éxito");
        await api.login({ username: emailOrUser, password });
        router.push("/es/studio");
      }
    } catch (error: any) {
      toast.error(error?.response?.data?.detail || "Error en la autenticación");
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setIsGoogleLoading(true);
    try {
      const response = await api.getGoogleAuthUrl();
      if (response?.auth_url) window.location.href = response.auth_url;
    } catch (error) {
      toast.error("Error al conectar con Google");
      setIsGoogleLoading(false);
    }
  };

  const handleDiscordLogin = () => {
    setIsDiscordLoading(true);
    toast("Iniciando conexión con Discord...", { icon: "👾" });
    setTimeout(() => setIsDiscordLoading(false), 2000);
  };

  const cancelOauthFlow = () => {
    setOauthPending(null);
    sessionStorage.removeItem("oauth_pending");

    // Limpiamos la URL por si tiene el ?step=oauth_invite
    if (searchParams.get("step") === "oauth_invite") {
      // Reemplazamos la URL sin recargar la página para que sea fluido
      router.replace("/es/login");
    }
  };

  return {
    state: {
      isLogin,
      isLoading,
      isGoogleLoading,
      isDiscordLoading,
      emailOrUser,
      password,
      inviteCode,
      isInviteLocked,
      oauthPending,
    },
    actions: {
      setIsLogin,
      setEmailOrUser,
      setPassword,
      setInviteCode,
      handleSubmit,
      handleGoogleLogin,
      handleDiscordLogin,
      handleOauthSubmit,
      cancelOauthFlow,
    },
  };
}
