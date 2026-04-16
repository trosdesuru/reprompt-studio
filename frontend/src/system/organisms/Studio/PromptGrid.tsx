"use client";
import { useEffect, useState } from "react";
import { useStudioUI } from "@/src/store/useStudioUI";
import { IconPhotoOff, IconLoader2 } from "@tabler/icons-react";
import { fetchSeguro } from "@/src/services/api/client";

export default function PromptGrid() {
  const { activeDirectoryId, searchQuery } = useStudioUI();
  const [prompts, setPrompts] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchPrompts = async () => {
      setLoading(true);
      try {
        const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";
        const endpoint = searchQuery
          ? `/search/studio?q=${searchQuery}`
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
  }, [activeDirectoryId, searchQuery]);

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
              <img src={p.url} className="w-full h-full object-cover" alt={p.prompt} />
              <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity p-3 flex flex-col justify-end">
                <p className="text-[10px] text-white line-clamp-2">{p.prompt}</p>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="flex-1 border-2 border-dashed rounded-2xl flex flex-col items-center justify-center text-muted-foreground">
          <IconPhotoOff size={48} stroke={1} />
          <p className="mt-2 text-sm">No hay imágenes en esta ubicación.</p>
        </div>
      )}
    </div>
  );
}
