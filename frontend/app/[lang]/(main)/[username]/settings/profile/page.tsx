"use client";

import { use, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/src/store/authStore";
import { UpdateUsernameForm } from "@/src/features/user/components/UpdateUsernameForm";

export default function ProfileSettingsPage({
  params,
}: {
  params: Promise<{ lang: string; username: string }>;
}) {
  const { lang, username } = use(params);
  const router = useRouter();
  const { user, isLoadingAuth } = useAuthStore();

  const decodedUsername = decodeURIComponent(username);

  // Guardián de Rutas (Directriz 10: Confianza Cero)
  useEffect(() => {
    if (!isLoadingAuth) {
      if (!user) {
        router.push(`/${lang}/login`);
      } else if (user.username !== decodedUsername) {
        console.warn("🚫 Intento de acceso a ajustes ajenos.");
        router.push(`/${lang}/${encodeURIComponent(user.username)}/settings/profile`);
      }
    }
  }, [user, isLoadingAuth, decodedUsername, lang, router]);

  if (isLoadingAuth || user?.username !== decodedUsername) {
    return null; // O un skeleton de carga
  }

  return (
    <div className="max-w-2xl animate-fade-in space-y-8">
      {/* Cabecera de la Página */}
      <header>
        <h1 className="text-2xl font-black tracking-tighter uppercase">Perfil Público</h1>
        <p className="text-sm text-muted-foreground mt-2">
          Gestiona tu identidad y cómo te ven los demás en la comunidad.
        </p>
      </header>

      {/* AQUÍ APILAREMOS LOS MÓDULOS EN EL FUTURO:
        <UpdateAvatarForm />
        <UpdateBioForm />
      */}
      
      <div className="space-y-8">
        <UpdateUsernameForm lang={lang} />
      </div>
    </div>
  );
}