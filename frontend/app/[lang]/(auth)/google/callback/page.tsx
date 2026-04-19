"use client";

import { api } from "@/src/services/api";
import { useAuthStore } from "@/src/store/authStore";
import { useEffect, useRef } from "react";
import { useRouter, useSearchParams, useParams } from "next/navigation";
import { PageLoader } from "@/src/system/atoms/PageLoader";
import toast from "react-hot-toast";

export default function GoogleCallbackPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const params = useParams();
  const lang = params?.lang as string;

  const processed = useRef(false);
  const checkAuth = useAuthStore((state) => state.checkAuth);

  useEffect(() => {
    if (processed.current) return;

    const code = searchParams.get("code");
    if (!code) {
      toast.error("No se recibió código de autenticación de Google.");
      router.push(`/${lang}/login`);
      return;
    }

    processed.current = true;

    const authenticate = async () => {
      try {
        const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || window.location.origin;
        const redirectUri = `${baseUrl}${window.location.pathname}`;

        console.log("📤 Canjeando código con Redirect URI oficial:", redirectUri);

        const response = await api.auth.verifyGoogleCode({ code, redirect_uri: redirectUri });

        if (response.status === "needs_invite") {
          toast.success("Cuenta verificada. ¡Solo falta tu código de invitación!");

          sessionStorage.setItem(
            "oauth_pending",
            JSON.stringify({
              email: response.email,
              token: response.provider_token,
              username: response.suggested_username,
            }),
          );

          router.push(`/${lang}/login?step=oauth_invite`);
        } else {
          toast.success(`¡Bienvenido de nuevo, ${response.suggested_username}!`);

          await checkAuth();

          window.location.href = `/${lang}`;
        }
      } catch (error: any) {
        toast.error(error.message || "Fallo al conectar con Google");
        router.push(`/${lang}/login`);
      }
    };

    authenticate();
  }, [searchParams, router, checkAuth, lang]);

  return <PageLoader text="Cifrando conexión segura con Google..." />;
}
