"use client";

import { use } from "react";
import Link from "next/link";
import { PageLoader } from "@/src/system/atoms/PageLoader";
import { IconPhotoOff, IconFolder } from "@tabler/icons-react";

import { PromptCard } from "@/src/system/molecules/Studio/PromptCard";
import { usePublicProfile } from "@/src/features/public/hooks/usePublicProfile";
import { Breadcrumbs } from "@/src/system/molecules/Navigation/Breadcrumbs";

export default function PublicProfilePage({
  params,
}: {
  params: Promise<{ lang: string; username: string; index: number }>;
}) {
  const { lang, username } = use(params);

  const { data, isLoading, error } = usePublicProfile(username);

  if (isLoading) {
    return <PageLoader text="Sincronizando perfil..." />;
  }

  if (error || !data) {
    return (
      <div className="max-h-screen flex flex-col items-center justify-center font-mono gap-4">
        <p className="text-red-500">
          {error || "Este usuario no existe o se ha perdido en el vacío."}
        </p>
        <Link
          href={`/${lang}`}
          className="text-(--accent-color) hover:underline uppercase text-xs tracking-widest"
        >
          ← Volver al inicio
        </Link>
      </div>
    );
  }

  const breadcrumbItems = [{ label: `@${data.user.username}` }];

  return (
    <main className="max-h-screen bg-background p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        <div>
          <Breadcrumbs items={breadcrumbItems} />
        </div>

        <header className="flex flex-col gap-2 border-b border-border pb-8">
          <h1 className="text-4xl font-black tracking-tighter">@{data.user.username}</h1>
          <p className="text-muted-foreground font-mono text-sm uppercase tracking-widest">
            {data.user.role}
          </p>
        </header>

        {data.directories.length > 0 && (
          <section className="space-y-4">
            <h2 className="text-sm font-mono font-bold uppercase tracking-widest flex items-center gap-2">
              <IconFolder size={18} className="text-(--accent-color)" /> Colecciones
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
              {data.directories.map((col) => (
                <Link
                  key={col.id}
                  href={`/${lang}/${username}/${col.slug}`}
                  className="group p-4 bg-muted/10 neo-border hover:bg-muted/30 transition-colors"
                >
                  <h3 className="font-bold text-lg group-hover:text-(--accent-color) transition-colors">
                    {col.name}
                  </h3>
                  <p className="text-xs text-muted-foreground mt-1">
                    {col.description || "Sin descripción"}
                  </p>
                </Link>
              ))}
            </div>
          </section>
        )}

        <section className="space-y-4">
          <h2 className="text-sm text-accent font-mono font-bold uppercase tracking-widest">
            Últimas Generaciones
          </h2>
          {data.recent_prompts.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-muted-foreground/50 bg-muted/5 rounded-xl border border-dashed border-border/50">
              <IconPhotoOff size={48} stroke={1} className="mb-4" />
              <p className="font-mono text-xs uppercase tracking-widest">No hay prompts públicos</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-6">
              {data.recent_prompts.map((prompt, index) => (
                <PromptCard
                  key={prompt.id}
                  item={prompt}
                  index={index}
                  isPriority={index < 6}
                  lang={lang}
                  authorUsername={username}
                />
              ))}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
