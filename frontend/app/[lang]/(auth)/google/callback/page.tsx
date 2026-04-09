"use client";

import { api } from "@/src/services/api";
import { useAuthStore } from "@/src/store/authStore";
import { useEffect, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { PageLoader } from "@/src/system/atoms/PageLoader";
import toast from "react-hot-toast";

export default function GoogleCallbackPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const processed = useRef(false);
  
  // 🟢 Extraemos la función para actualizar el estado global
  const checkAuth = useAuthStore((state) => state.checkAuth);

  useEffect(() => {
    // 1. Evitamos que se ejecute dos veces en React Strict Mode
    if (processed.current) return;

    const code = searchParams.get("code");
    if (!code) {
      toast.error("No se recibió código de autenticación de Google.");
      router.push("/es/auth/login"); // Asegúrate de que esta es tu ruta correcta
      return;
    }

    processed.current = true;

    const authenticate = async () => {
      try {
        const currentUrl = new URL(window.location.href);
        const redirectUri = `${currentUrl.origin}${currentUrl.pathname}`;

        const response = await api.auth.verifyGoogleCode({ code, redirect_uri: redirectUri });

        if (response.status === "needs_invite") {
          toast.success("Cuenta verificada. ¡Solo falta tu código VIP!");

          sessionStorage.setItem(
            "oauth_pending",
            JSON.stringify({
              email: response.email,
              token: response.provider_token,
              username: response.suggested_username,
            }),
          );

          router.push(`/es/login?step=oauth_invite`);
        } else {
          toast.success(`¡Bienvenido de nuevo, ${response.username}!`);
          
          await checkAuth();
          
          window.location.href = "/es";
        }
      } catch (error: any) {
        toast.error(error.message || "Fallo al conectar con Google");
        router.push("/es/login");
      }
    };

    authenticate();
  }, [searchParams, router, checkAuth]);

  return <PageLoader text="Cifrando conexión segura con Google..." />;
}