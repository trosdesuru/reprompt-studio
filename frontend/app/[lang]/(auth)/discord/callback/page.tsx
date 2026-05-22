"use client";

import { useRouter, useSearchParams, useParams } from "next/navigation";
import { useEffect, useRef } from "react";
import { api } from "@/src/services/api";
import { PageLoader } from "@/src/system/atoms/Loader/PageLoader";
import toast from "react-hot-toast";

export default function DiscordCallbackPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const params = useParams();
  const lang = params?.lang || "es";

  const processed = useRef(false);

  useEffect(() => {
    if (processed.current) return;

    const code = searchParams.get("code");
    if (!code) {
      toast.error("No se recibió código de Discord.");
      router.push("/es/auth/login");
      return;
    }

    processed.current = true;

    const authenticate = async () => {
      try {
        const currentUrl = new URL(document.location.href);
        const redirectUri = `${currentUrl.origin}${currentUrl.pathname}`;

        const response = await api.verifyDiscordCode({ code, redirect_uri: redirectUri });

        if (response.status === "needs_invite") {
          toast.success("Cuenta de Discord vinculada. Introduce tu código de inivitación");
          router.push(`/${lang}/auth/login?discord_email=${response.email}`);
        } else {
          toast.success(`¡Bienvenido de nuevo, ${response.username}!`);
          router.push("/es");
        }
      } catch (error: any) {
        toast.error(error.message || "Fallo al validar Discord");
        router.push(`/${lang}/login`);
      }
    };

    authenticate();
  }, [searchParams, router]);

  return <PageLoader text="Verificando enlace cifrado con Discord..." />;
}
