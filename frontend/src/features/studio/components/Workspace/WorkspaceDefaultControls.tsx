"use client";

import Link from "next/link";
import {
  IconScanTraces,
  IconArrowsSort,
  IconSquareCheck,
  IconLayoutGrid,
  IconList,
} from "@tabler/icons-react";
import { useStudioUI } from "@/src/store/useStudioUI";

interface WorkspaceDefaultControlsProps {
  lang: string;
  sortBy: string;

  setSortBy: (val: "newest" | "oldest" | "software") => void;
  onSelectAll: () => void;
}

export function WorkspaceDefaultControls({
  lang,
  sortBy,
  setSortBy,
  onSelectAll,
}: Readonly<WorkspaceDefaultControlsProps>) {
  const viewMode = useStudioUI((state) => state.viewMode);
  const setViewMode = useStudioUI((state) => state.setViewMode);

  return (
    <div className="flex items-center gap-3 shrink-0">
      <Link
        href={`/${lang}/reprompt`}
        className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg text-xs font-bold hover:bg-primary/90 transition-all shadow-sm active:scale-95"
      >
        <IconScanTraces size={16} />
        <span className="hidden sm:inline tracking-widest">Extractor</span>
      </Link>

      <div className="hidden sm:flex items-center bg-muted/50 rounded-lg p-1 border border-border/50">
        <button
          onClick={() => setViewMode("grid")}
          className={`p-1.5 rounded-md transition-all ${
            viewMode === "grid"
              ? "bg-background shadow-sm text-foreground"
              : "text-muted-foreground hover:text-foreground"
          }`}
          title="Vista Cuadrícula"
        >
          <IconLayoutGrid size={16} />
        </button>
        <button
          onClick={() => setViewMode("list")}
          className={`p-1.5 rounded-md transition-all ${
            viewMode === "list"
              ? "bg-background shadow-sm text-foreground"
              : "text-muted-foreground hover:text-foreground"
          }`}
          title="Vista Lista"
        >
          <IconList size={16} />
        </button>
      </div>

      <div className="hidden sm:flex items-center bg-muted/50 rounded-lg p-1 border border-border/50">
        <IconArrowsSort size={14} className="text-muted-foreground ml-2" />
        <select
          className="bg-transparent text-xs font-mono p-1.5 outline-none cursor-pointer text-foreground/80"
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value as "newest" | "oldest" | "software")}
        >
          <option value="newest">Más recientes</option>
          <option value="oldest">Más antiguos</option>
          <option value="software">Por Software</option>
        </select>
      </div>

      <button
        onClick={onSelectAll}
        className="hidden sm:flex items-center gap-2 px-3 py-2 bg-muted/50 hover:bg-muted text-muted-foreground hover:text-foreground rounded-lg text-xs font-bold transition-all border border-border/50"
        title="Seleccionar todo lo cargado"
      >
        <IconSquareCheck size={16} />
        <span>Seleccionar Todo</span>
      </button>
    </div>
  );
}
