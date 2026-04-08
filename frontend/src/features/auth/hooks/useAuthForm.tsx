import { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { api } from "@/src/services/api";
import toast from "react-hot-toast";

export function useAuthForm() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [isLogin, setIsLogin] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [isDiscordLoading, setIsDiscordLoading] = useState(false);

  const [emailOrUser, setEmailOrUser] = useState("");
  const [password, setPassword] = useState("");
  const [inviteCode, setInviteCode] = useState("");
  const [isInviteLocked, setIsInviteLocked] = useState(false);

  // Detección de código en la URL
  useEffect(() => {
    const codeFromUrl = searchParams.get("code");
    if (codeFromUrl) {
      setIsLogin(false);
      setInviteCode(codeFromUrl);
      setIsInviteLocked(true);
    }
  }, [searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (isLogin) {
        await api.login({ username: emailOrUser, password });
        toast.success("¡Bienvenido de nuevo!");
        router.push("/es/studio");
      } else {
        await api.registrar({
          email: emailOrUser,
          username: emailOrUser,
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
    },
    actions: {
      setIsLogin,
      setEmailOrUser,
      setPassword,
      setInviteCode,
      handleSubmit,
      handleGoogleLogin,
      handleDiscordLogin,
    },
  };
}
