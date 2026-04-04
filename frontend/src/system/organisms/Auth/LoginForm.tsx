"use client";

import { useLoginForm } from "@/src/features/auth/hooks/useLoginForm";
import { useGoogleAuth } from "@/src/features/auth/hooks/useGoogleAuth";
import { GoogleLogin } from "@react-oauth/google";

import { FormField } from "@/src/system/molecules/FormField";
import { Button } from "@/src/system/atoms/Button";
import { IconArrowLeft } from "@tabler/icons-react";
import { FormDivider } from "../../atoms/Login/FormDivider";
import { FormHeader } from "../../atoms/Login/FormHeader";

export function LoginForm() {
  const standardAuth = useLoginForm();
  const googleAuth = useGoogleAuth();

  return (
    <div className="w-full max-w-md mx-auto p-8 bg-(--bg-secondary) neo-border neo-shadow">
      {googleAuth.step === "invite" ? (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-300">
          <div className="mb-8 text-center">
            <h2 className="text-2xl font-black uppercase font-mono tracking-tighter">
              Último <span className="text-(--accent-color)">Paso</span>
            </h2>
            <p className="text-xs font-mono text-(--text-secondary) mt-2 uppercase">
              Completa tu registro con Google
            </p>
          </div>

          <form onSubmit={googleAuth.handleJoinSubmit} className="space-y-6">
            <FormField
              label="Tu email"
              name="email"
              type="text"
              value={googleAuth.username}
              onChange={(e) => googleAuth.setUsername(e.target.value)}
              placeholder="reprompt@mail.com"
              required
            />

            <FormField
              label="Código de invitación"
              name="inviteCode"
              type="text"
              value={googleAuth.inviteCode}
              onChange={(e) => googleAuth.setInviteCode(e.target.value)}
              placeholder="ej. VGR-A1234B56"
              className="uppercase"
              required
            />

            <div className="flex flex-col-reverse sm:flex-row gap-4 pt-2">
              <Button
                type="button"
                onClick={googleAuth.cancelGoogleLogin}
                disabled={googleAuth.isLoading}
                className="w-full sm:w-1/3 justify-center h-12 bg-transparent text-foreground border border-border hover:bg-muted font-mono uppercase text-xs"
              >
                <IconArrowLeft size={16} className="mr-2" /> Volver
              </Button>

              <Button
                type="submit"
                isLoading={googleAuth.isLoading}
                className="w-full sm:w-2/3 justify-center h-12 text-sm font-black uppercase tracking-widest bg-white text-black hover:bg-gray-200"
              >
                Completar
              </Button>
            </div>
          </form>
        </div>
      ) : (
        <div className="animate-in fade-in zoom-in-95 duration-300">
          <FormHeader />

          <div className="mt-6 flex justify-center w-full">
            {/* 🟢 Botón nativo de Google que abre el Popup */}
            <GoogleLogin
              onSuccess={googleAuth.handleGoogleSuccess}
              onError={googleAuth.handleGoogleError}
              useOneTap={false}
              theme="filled_black"
              shape="rectangular"
              text="continue_with"
            />
          </div>

          <FormDivider />

          <form onSubmit={standardAuth.handleSubmit} className="space-y-6">
            <FormField
              label="email"
              name="username"
              type="text"
              value={standardAuth.formData.username}
              onChange={standardAuth.handleChange}
              placeholder="reprompt@mail.com"
              autoComplete="username"
              required
            />

            <FormField
              label="Password"
              name="password"
              type="password"
              value={standardAuth.formData.password}
              onChange={standardAuth.handleChange}
              autoComplete="current-password"
              placeholder="••••••••"
              required
            />

            <Button
              type="submit"
              isLoading={standardAuth.isLoading}
              className="w-full justify-center h-12 text-sm font-black uppercase tracking-widest"
            >
              Entrar
            </Button>
          </form>
        </div>
      )}
    </div>
  );
}