"use client";

import { use, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/src/store/authStore";
import { useUpdateUsername } from "@/src/features/user/hooks/useUpdateUsername";
import { Button } from "@/src/system/atoms/Button";
import { IconUserEdit, IconAt } from "@tabler/icons-react";
import { slugifyUsername } from "@/src/utils/lib/string";

export default function ProfileSettingsPage({
  params,
}: {
  params: Promise<{ lang: string; username: string }>;
}) {
  const { lang, username } = use(params);
  const router = useRouter();
  const { user, isLoadingAuth } = useAuthStore();
  const { handleUpdate, isLoading } = useUpdateUsername(lang);

  const [inputValue, setInputValue] = useState("");

  const decodedUsername = decodeURIComponent(username);

  useEffect(() => {
    if (user?.username) {
      setInputValue(user.username);
    }
  }, [user]);

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

  const onSave = async (e: React.FormEvent) => {
    e.preventDefault();
    await handleUpdate(inputValue);
  };

  if (isLoadingAuth || user?.username !== decodedUsername) {
    return null;
  }

  return (
    <main className="max-w-2xl mx-auto p-6 md:p-12 space-y-10">
      <header className="space-y-2">
        <h1 className="text-3xl font-black tracking-tighter uppercase">Ajustes de Perfil</h1>
        <p className="text-muted-foreground font-mono text-xs tracking-widest uppercase">
          Gestiona tu identidad en Reprompt
        </p>
      </header>

      <section className="bg-(--bg-secondary) p-8 neo-border neo-shadow space-y-6">
        <div className="flex items-center gap-3 border-b-2 border-border pb-4">
          <IconUserEdit size={24} className="text-(--accent-color)" />
          <h2 className="text-lg font-bold uppercase font-mono">Nombre de Usuario</h2>
        </div>

        <form onSubmit={onSave} className="space-y-4">
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground">
              <IconAt size={18} />
            </span>
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="nuevo_nombre"
              className="w-full bg-background neo-border p-4 pl-12 font-mono text-lg focus:outline-none focus:neo-shadow-accent transition-all"
            />
          </div>

          <div className="bg-muted/10 p-4 neo-border border-dashed border-muted-foreground/30">
            <p className="text-[10px] font-mono text-muted-foreground uppercase leading-relaxed">
              Vista previa de tu URL: <br />
              <span className="text-(--accent-color)">
                reprompt.studio/{lang}/{slugifyUsername(inputValue) || "..."}
              </span>
            </p>
          </div>

          <p className="text-[10px] text-red-500/70 font-mono uppercase italic">
            * Al cambiar tu nombre, tu sesión se cerrará por seguridad y la URL antigua dejará de
            funcionar.
          </p>

          <Button
            type="submit"
            variant="primary"
            isLoading={isLoading}
            className="w-full py-6 text-md"
            disabled={inputValue === user?.username || !inputValue}
          >
            Guardar nueva identidad
          </Button>
        </form>
      </section>
    </main>
  );
}
