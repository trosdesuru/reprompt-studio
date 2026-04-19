"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { useStudioUI } from "@/src/store/useStudioUI";
import { useAuthStore } from "@/src/store/authStore";
import { IconPhotoOff } from "@tabler/icons-react";
import { fetchSeguro } from "@/src/services/api/client";
import { PageLoader } from "../../atoms/PageLoader";
import { PromptCard } from "./PromptCard";

export default function PromptGrid() {
  const { activeDirectoryId, searchQuery } = useStudioUI();
  const user = useAuthStore((state) => state.user);
  const params = useParams();
  const lang = (params?.lang as string) || "es";

  const [debouncedQuery, setDebouncedQuery] = useState(searchQuery);
  const [prompts, setPrompts] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedQuery(searchQuery);
    }, 1000);
    return () => clearTimeout(handler);
  }, [searchQuery]);

  useEffect(() => {
    const fetchPrompts = async () => {
      setLoading(true);
      try {
        const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";

        const endpoint = debouncedQuery
          ? `/search/studio?q=${debouncedQuery}`
          : `/prompts/studio?directory_id=${activeDirectoryId || ""}`;

        const res = await fetchSeguro(`${API_URL}${endpoint}`, { credentials: "include" });
        if (res.ok) {
          const data = await res.json();
          setPrompts(data.results || data.data || []);
        }
      } catch (err) {
        console.error("Error en Studio Grid:", err);
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
          <PageLoader text="Sincronizando Studio..." />
        </div>
      ) : prompts.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
          {prompts.map((p: any, index) => (
            <PromptCard
              key={p.id}
              item={p}
              index={index}
              lang={lang}
              isStudio={true}
              authorUsername={user?.username || "unknown"}
              isPriority={index < 8}
            />
          ))}
        </div>
      ) : (
        <div className="flex-1 flex flex-col items-center justify-center text-muted-foreground/40">
          <IconPhotoOff size={48} stroke={1.5} className="mb-4" />
          <p className="text-sm font-mono uppercase tracking-widest text-center px-4">
            No se encontraron prompts en este rincón
          </p>
        </div>
      )}
    </div>
  );
}
