"use client";

import { IconArrowLeft, IconCopy, IconCheck, IconWand, IconUser } from "@tabler/icons-react";
import { use, useEffect, useState } from "react";
import { api } from "@/src/services/api";

import dynamic from "next/dynamic";
import Link from "next/link";

const ImageViewerModal = dynamic(
  () =>
    import("@/src/system/organisms/Viewer/ImageViewerModal/ImageViewerModal").then(
      (mod) => mod.ImageViewerModal,
    ),
  { ssr: false },
);

export default function PromptDetailPage({
  params,
}: {
  params: Promise<{ lang: string; username: string; prompt_id: string }>;
}) {
  const { lang, username, prompt_id } = use(params);
  const [data, setData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [isViewerOpen, setIsViewerOpen] = useState(false);

  useEffect(() => {
    api
      .getPublicPromptDetail(prompt_id)
      .then((res) => setData(res))
      .catch((err) => console.error(err))
      .finally(() => setIsLoading(false));
  }, [prompt_id]);

  const handleCopy = () => {
    if (data?.prompt?.prompt) {
      navigator.clipboard.writeText(data.prompt.prompt);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (isLoading)
    return (
      <div className="min-h-screen flex items-center justify-center font-mono animate-pulse">
        Cargando datos IA...
      </div>
    );
  if (!data)
    return (
      <div className="min-h-screen flex items-center justify-center font-mono text-red-500">
        Imagen no encontrada.
      </div>
    );

  const { prompt, user, collection, related_collection, related_user } = data;

  return (
    <main className="min-h-screen bg-background p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        <Link
          href={`/${lang}`}
          className="inline-flex items-center gap-2 text-xs font-mono text-muted-foreground hover:text-foreground transition-colors uppercase tracking-widest mb-6"
        >
          <IconArrowLeft size={16} /> Volver al Feed
        </Link>

        <div className="flex flex-col lg:flex-row gap-8">
          <div className="flex-1 space-y-12">
            <div
              onClick={() => setIsViewerOpen(true)}
              className="bg-muted/10 neo-border rounded-xl overflow-hidden cursor-zoom-in relative group"
            >
              <img
                src={prompt.image_url}
                alt={prompt.title}
                className="w-full h-auto object-contain max-h-[70vh]"
              />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors flex items-center justify-center">
                <span className="bg-black/70 text-white font-mono text-xs uppercase tracking-widest px-4 py-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity backdrop-blur-sm">
                  Ampliar
                </span>
              </div>
            </div>

            {related_user?.length > 0 && (
              <section className="space-y-4 pt-8 border-t border-border">
                <h3 className="text-sm font-mono font-bold uppercase tracking-widest flex items-center gap-2">
                  <IconUser size={18} /> Más de @{user.username}
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                  {related_user.map((rp: any) => (
                    <Link
                      key={rp.id}
                      href={`/${lang}/${user.username}/p/${rp.id}`}
                      className="bg-muted/10 neo-border rounded-lg overflow-hidden aspect-4/5 hover:neo-shadow-accent transition-all"
                    >
                      <img
                        src={rp.image_url}
                        alt={rp.title}
                        className="w-full h-full object-cover"
                      />
                    </Link>
                  ))}
                </div>
              </section>
            )}
          </div>

          <div className="w-full lg:w-400px flex flex-col gap-6">
            <div className="flex items-center gap-3 p-4 bg-muted/10 neo-border rounded-xl">
              <div className="w-10 h-10 bg-(--accent-color) rounded-full flex items-center justify-center text-white font-bold font-mono">
                {user.username.charAt(0).toUpperCase()}
              </div>
              <div>
                <Link href={`/${lang}/${user.username}`} className="font-bold hover:underline">
                  @{user.username}
                </Link>
                <p className="text-xs text-muted-foreground font-mono uppercase">{user.role}</p>
              </div>
            </div>

            <div className="bg-background neo-border rounded-xl overflow-hidden flex flex-col">
              <div className="bg-muted/30 p-3 border-b border-border flex justify-between items-center">
                <span className="text-xs font-mono font-bold uppercase tracking-widest text-(--accent-color) flex items-center gap-2">
                  <IconWand size={16} /> Prompt
                </span>
                <button
                  onClick={handleCopy}
                  className="text-muted-foreground hover:text-foreground transition-colors p-1"
                  title="Copiar Prompt"
                >
                  {copied ? (
                    <IconCheck size={18} className="text-green-500" />
                  ) : (
                    <IconCopy size={18} />
                  )}
                </button>
              </div>
              <div className="p-4 bg-muted/5 max-h-300px overflow-y-auto custom-scrollbar">
                <p className="text-sm font-mono leading-relaxed">{prompt.prompt}</p>
              </div>
            </div>

            <div className="bg-background neo-border rounded-xl p-4 flex flex-col gap-3">
              {prompt.model && (
                <div className="flex justify-between text-xs font-mono">
                  <span className="text-muted-foreground">Modelo</span>
                  <span className="font-bold">{prompt.model}</span>
                </div>
              )}
              {prompt.sampler && (
                <div className="flex justify-between text-xs font-mono">
                  <span className="text-muted-foreground">Sampler</span>
                  <span className="font-bold">{prompt.sampler}</span>
                </div>
              )}
              {prompt.resolution && (
                <div className="flex justify-between text-xs font-mono">
                  <span className="text-muted-foreground">Resolución</span>
                  <span className="font-bold">{prompt.resolution}</span>
                </div>
              )}
              {prompt.software && (
                <div className="flex justify-between text-xs font-mono">
                  <span className="text-muted-foreground">Software</span>
                  <span className="font-bold">{prompt.software}</span>
                </div>
              )}
            </div>

            {collection && related_collection?.length > 0 && (
              <section className="space-y-4 mt-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-sm font-mono font-bold uppercase tracking-widest">
                    De la colección:{" "}
                    <Link
                      href={`/${lang}/${user.username}/${collection.slug}`}
                      className="text-(--accent-color) hover:underline"
                    >
                      {collection.name}
                    </Link>
                  </h3>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  {related_collection.map((rc: any) => (
                    <Link
                      key={rc.id}
                      href={`/${lang}/${user.username}/p/${rc.id}`}
                      className="bg-muted/10 neo-border rounded-lg overflow-hidden aspect-square hover:neo-shadow-accent transition-all"
                    >
                      <img
                        src={rc.image_url}
                        alt={rc.title}
                        className="w-full h-full object-cover"
                      />
                    </Link>
                  ))}
                </div>
              </section>
            )}
          </div>
        </div>
      </div>

      {isViewerOpen && (
        <ImageViewerModal
          title={prompt.title}
          pages={[{ image_url: prompt.image_url, name: prompt.title, prompt: prompt.prompt }]}
          isLoading={false}
          isLoadingMore={false}
          hasMorePages={false}
          onLoadMore={() => {}}
          onClose={() => setIsViewerOpen(false)}
        />
      )}
    </main>
  );
}
