// src/features/auth/hooks/useOAuth.ts
import { useGoogleAuth } from "./oauth/useGoogleAuth";
import { useDiscordAuth } from "./oauth/useDiscordAuth";
import { useOAuthPending } from "./oauth/useOAuthPending";

export function useOAuth() {
  // Inicializamos los micro-hooks
  const googleAuth = useGoogleAuth();
  const discordAuth = useDiscordAuth();
  const pendingAuth = useOAuthPending();

  // Devolvemos el contrato exacto que el useAuthForm espera
  return {
    // Estados
    oauthPending: pendingAuth.oauthPending,
    isGoogleLoading: googleAuth.isGoogleLoading,
    isDiscordLoading: discordAuth.isDiscordLoading,
    isOauthSubmitting: pendingAuth.isOauthSubmitting,

    // Acciones
    handleGoogleLogin: googleAuth.handleGoogleLogin,
    handleDiscordLogin: discordAuth.handleDiscordLogin,
    handleOauthSubmit: pendingAuth.handleOauthSubmit,
    cancelOauthFlow: pendingAuth.cancelOauthFlow,
  };
}
