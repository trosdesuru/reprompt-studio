"use client";

import { useEffect, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { api } from "@/src/services/api";
import { PageLoader } from "@/src/system/atoms/PageLoader";
import toast from "react-hot-toast";

export default function GoogleCallbackPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const processed = useRef(false);

  useEffect(() => {
    if (processed.current) return;

    const code = searchParams.get("code");
    if (!code) {
      toast.error("No se recibió código de autenticación de Google.");
      router.push("/es/auth/login");
      return;
    }

    processed.current = true;

    const authenticate = async () => {
      try {
        const currentUrl = new URL(window.location.href);
        const redirectUri = `${currentUrl.origin}${currentUrl.pathname}`;

        const response = await api.verifyGoogleCode({ code, redirect_uri: redirectUri });

        if (response.status === "needs_invite") {
          toast.success("Cuenta verificada. ¡Solo falta tu código VIP!");

          // 🟢 Guardamos la identidad de Google temporalmente en el navegador
          sessionStorage.setItem(
            "oauth_pending",
            JSON.stringify({
              email: response.email,
              token: response.provider_token,
              username: response.suggested_username,
            }),
          );

          router.push(`/es/auth/login?step=oauth_invite`);
        } else {
          toast.success(`¡Bienvenido de nuevo, ${response.username}!`);
          // 🟢 TRAMPA NEXT.JS EVITADA: Forzamos recarga dura para que el Middleware lea la cookie
          window.location.href = "/es/studio";
        }
      } catch (error: any) {
        toast.error(error.message || "Fallo al conectar con Google");
        router.push("/es/auth/login");
      }
    };

    authenticate();
  }, [searchParams, router]);

  return <PageLoader text="Cifrando conexión segura con Google..." />;
}
