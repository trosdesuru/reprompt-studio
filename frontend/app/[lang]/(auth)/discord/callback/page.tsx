"use client";

import { useEffect, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { api } from "@/src/services/api";
import { PageLoader } from "@/src/system/atoms/PageLoader";
import toast from "react-hot-toast";

export default function DiscordCallbackPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const processed = useRef(false);

  useEffect(() => {
    // Evitamos ejecuciones dobles en React 18 Strict Mode
    if (processed.current) return;

    const code = searchParams.get("code");
    if (!code) {
      toast.error("No se recibió código de Discord.");
      router.push("/es/login");
      return;
    }

    processed.current = true;

    const authenticate = async () => {
      try {
        const currentUrl = new URL(window.location.href);
        const redirectUri = `${currentUrl.origin}${currentUrl.pathname}`;

        // Llamamos al nuevo endpoint de Discord que pusimos en la API
        const response = await api.verifyDiscordCode({ code, redirect_uri: redirectUri });

        if (response.status === "needs_invite") {
          toast.success("Cuenta de Discord vinculada. ¡Introduce un código VIP!");
          // Redirigimos a login con un estado para que complete el registro (Fase futura si la necesitas)
          router.push(`/es/login?discord_email=${response.email}`);
        } else {
          toast.success(`¡Bienvenido de nuevo, ${response.username}!`);
          router.push("/es/studio");
        }
      } catch (error: any) {
        toast.error(error.message || "Fallo al validar Discord");
        router.push("/es/login");
      }
    };

    authenticate();
  }, [searchParams, router]);

  return <PageLoader text="Verificando enlace cifrado con Discord..." />;
}
