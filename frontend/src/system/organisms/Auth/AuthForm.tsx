// src/system/organisms/Auth/AuthForm.tsx
"use client";

import { useAuthForm } from "@/src/features/auth/hooks/useAuthForm";
import { AuthTabs } from "../../molecules/Tabs/AuthTabs";
import { AuthHeader } from "../../molecules/Auth/AuthHeader";
import { SocialLogins } from "../../molecules/Auth/SocialLogins";
import { AuthSeparator } from "../../atoms/Login/AuthSeparator";
import { CredentialsForm } from "../../molecules/Auth/CredentialsForm";

export function AuthForm() {
  const { state, actions } = useAuthForm();

  return (
    <div className="w-full max-w-md mx-auto p-8 bg-(--bg-secondary) neo-border neo-shadow animate-in fade-in zoom-in-95 duration-300">
      
      <AuthTabs isLogin={state.isLogin} onToggle={actions.setIsLogin} />

      <div className="mt-8">
        <AuthHeader isLogin={state.isLogin} />

        <SocialLogins
          isLoading={state.isLoading}
          isGoogleLoading={state.isGoogleLoading}
          isDiscordLoading={state.isDiscordLoading}
          onGoogle={actions.handleGoogleLogin}
          onDiscord={actions.handleDiscordLogin}
        />

        <AuthSeparator />

        <CredentialsForm
          isLogin={state.isLogin}
          isLoading={state.isLoading}
          isSocialLoading={state.isGoogleLoading || state.isDiscordLoading}
          emailOrUser={state.emailOrUser}
          password={state.password}
          inviteCode={state.inviteCode}
          isInviteLocked={state.isInviteLocked}
          onEmailChange={actions.setEmailOrUser}
          onPasswordChange={actions.setPassword}
          onInviteChange={actions.setInviteCode}
          onSubmit={actions.handleSubmit}
        />
      </div>
    </div>
  );
}