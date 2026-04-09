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

  if (state.oauthPending) {
    return (
      <div className="w-full max-w-md mx-auto p-8 bg-(--bg-secondary) neo-border neo-shadow animate-in fade-in zoom-in-95 duration-300">
        <div className="mb-8 text-center">
          <h2 className="text-2xl font-black uppercase font-mono tracking-tighter">
            Último <span className="text-(--accent-color)">Paso</span>
          </h2>
          <p className="text-xs font-mono text-(--text-secondary) mt-2 uppercase">
            Vinculando: {state.oauthPending.email}
          </p>
        </div>

        <form onSubmit={actions.handleOauthSubmit} className="flex flex-col gap-6">
          <div className="relative">
            <input
              type="text"
              required
              placeholder="CÓDIGO DE INVITACIÓN"
              value={state.inviteCode}
              onChange={(e) => actions.setInviteCode(e.target.value.toUpperCase())}
              className="w-full h-12 bg-background border border-border pl-4 pr-3 text-sm font-mono uppercase focus:outline-none focus:border-(--accent-color) transition-colors"
              disabled={state.isLoading}
            />
          </div>

          <div className="flex flex-col-reverse sm:flex-row gap-4">
            <button
              type="button"
              onClick={actions.cancelOauthFlow}
              disabled={state.isLoading}
              className="w-full sm:w-1/3 justify-center h-12 bg-transparent text-foreground border border-border hover:bg-muted font-mono uppercase text-xs font-black tracking-widest transition-colors disabled:opacity-50"
            >
              Volver
            </button>
            <button
              type="submit"
              disabled={state.isLoading}
              className="w-full sm:w-2/3 justify-center h-12 text-sm font-black uppercase font-mono tracking-widest bg-white text-black hover:bg-gray-200 neo-border transition-all disabled:opacity-50"
            >
              {state.isLoading ? "Procesando..." : "Completar"}
            </button>
          </div>
        </form>
      </div>
    );
  }

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
