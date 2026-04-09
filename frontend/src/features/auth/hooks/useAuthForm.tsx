// src/features/auth/hooks/useAuthForm.ts
import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { useOAuth } from "./useOAuth";
import { useCredentialsAuth } from "./useCredentialsAuth";

export function useAuthForm() {
  const searchParams = useSearchParams();

  // Dependencias
  const oauth = useOAuth();
  const credsAuth = useCredentialsAuth();

  // Estado puro de la UI (Inputs)
  const [isLogin, setIsLogin] = useState(true);
  const [emailOrUser, setEmailOrUser] = useState("");
  const [password, setPassword] = useState("");
  const [inviteCode, setInviteCode] = useState("");
  const [isInviteLocked, setIsInviteLocked] = useState(false);

  // Manejo de código de invitación por URL
  useEffect(() => {
    const codeFromUrl = searchParams.get("code");
    if (codeFromUrl) {
      setIsLogin(false);
      setInviteCode(codeFromUrl);
      setIsInviteLocked(true);
    }
  }, [searchParams]);

  // Wrappers para inyectar el estado actual en las funciones de los submódulos
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    credsAuth.handleCredentialsSubmit(isLogin, emailOrUser, password, inviteCode);
  };

  const handleOauthSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    oauth.handleOauthSubmit(inviteCode);
  };

  // Estado derivado para bloquear la UI si ALGO está cargando
  const isAnyLoading = credsAuth.isCredsLoading || oauth.isOauthSubmitting;

  return {
    state: {
      isLogin,
      isLoading: isAnyLoading,
      isGoogleLoading: oauth.isGoogleLoading,
      isDiscordLoading: oauth.isDiscordLoading,
      emailOrUser,
      password,
      inviteCode,
      isInviteLocked,
      oauthPending: oauth.oauthPending,
    },
    actions: {
      setIsLogin,
      setEmailOrUser,
      setPassword,
      setInviteCode,
      handleSubmit,
      handleOauthSubmit,
      handleGoogleLogin: oauth.handleGoogleLogin,
      handleDiscordLogin: oauth.handleDiscordLogin,
      cancelOauthFlow: oauth.cancelOauthFlow,
    },
  };
}