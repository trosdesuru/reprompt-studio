"use client";
import { useEffect, useState } from "react";
import { useStudioUI } from "@/src/store/useStudioUI";
import { IconPhotoOff, IconLoader2 } from "@tabler/icons-react";
import { fetchSeguro } from "@/src/services/api/client";

export default function PromptGrid() {
  const { activeDirectoryId, searchQuery } = useStudioUI();

  const [debouncedQuery, setDebouncedQuery] = useState(searchQuery);
  const [prompts, setPrompts] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedQuery(searchQuery);
    }, 1000);

    return () => {
      clearTimeout(handler);
    };
  }, [searchQuery]);

  useEffect(() => {
    const fetchPrompts = async () => {
      setLoading(true);
      try {
        const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";

        // OJO: Usamos debouncedQuery aquí, NO searchQuery
        const endpoint = debouncedQuery
          ? `/search/studio?q=${debouncedQuery}`
          : `/prompts/studio?directory_id=${activeDirectoryId || ""}`;

        const res = await fetchSeguro(`${API_URL}${endpoint}`, { credentials: "include" });
        if (res.ok) {
          const data = await res.json();
          setPrompts(data.results || data.data || []);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchPrompts();
  }, [activeDirectoryId, debouncedQuery]);

  return (
    <div className="h-full flex flex-col">
      {loading ? (
        <div className="flex-1 flex items-center justify-center">
          <IconLoader2 className="animate-spin text-primary" size={40} />
        </div>
      ) : prompts.length > 0 ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {prompts.map((p: any) => (
            <div
              key={p.id}
              className="aspect-square bg-secondary rounded-lg overflow-hidden border group relative"
            >
              {/* 🛡️ DEFENSA: Usamos image_url y proveemos un estado de error elegante */}
              {p.image_url ? (
                <img
                  src={p.image_url}
                  className="w-full h-full object-cover"
                  alt={p.prompt || "Prompt sin título"}
                />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center bg-muted/20 text-muted-foreground/50">
                  <IconPhotoOff size={32} stroke={1.5} />
                  <span className="text-[10px] uppercase tracking-widest mt-2 font-mono">
                    Sin Media
                  </span>
                </div>
              )}

              <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity p-3 flex flex-col justify-end">
                <p className="text-[10px] text-white line-clamp-2 font-mono">
                  {p.prompt || "Sin descripción"}
                </p>
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* 🛡️ ESTADO DE VACÍO RESTAURADO */
        <div className="flex-1 flex flex-col items-center justify-center text-muted-foreground/50">
          <IconPhotoOff size={48} stroke={1.5} className="mb-4" />
          <p className="text-sm font-mono uppercase tracking-widest">No se encontraron prompts</p>
        </div>
      )}
    </div>
  );
}
