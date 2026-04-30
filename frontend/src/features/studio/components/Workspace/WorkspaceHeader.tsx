"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useStudioUI } from "@/src/store/useStudioUI";
import { useStudioPrompts } from "@/src/features/studio/hooks/useStudioPrompts";
import {
  IconChevronRight,
  IconScanTraces,
  IconLayoutSidebar,
  IconX,
  IconTrash,
  IconFolder,
} from "@tabler/icons-react";

export function WorkspaceHeader() {
  const { lang } = useParams();
  const {
    activeDirectoryId,
    setActiveDirectory,
    getBreadcrumbs,
    toggleSidebar,
    selectedPromptIds,
    clearSelection,
    directories,
  } = useStudioUI();

  const { deleteBulkPrompts, moveBulkPrompts } = useStudioPrompts();

  const breadcrumbs = getBreadcrumbs();
  const hasSelection = selectedPromptIds.length > 0;

  return (
    // 🟢 Contenedor estricto con overflow-hidden y posición relativa.
    // Esto es el secreto para que no haya "saltos" en la página al cambiar de modo.
    <header className="relative flex items-center w-full mb-6 pb-4 border-b border-border/30 min-h-13 overflow-hidden">
      {/* 🧭 ESTADO 1: NAVEGACIÓN NORMAL (Breadcrumbs) */}
      <div
        className={`absolute inset-0 flex items-center justify-between w-full transition-all duration-300 ease-in-out ${
          hasSelection
            ? "opacity-0 -translate-y-4 pointer-events-none"
            : "opacity-100 translate-y-0"
        }`}
      >
        <nav
          aria-label="Breadcrumb"
          className="flex items-center space-x-1 text-xs md:text-sm font-mono text-accent/40 lowercase overflow-x-auto scrollbar-none"
        >
          <button
            onClick={toggleSidebar}
            className="p-1.5 rounded-md hover:bg-secondary/20 hover:text-accent transition-colors text-muted-foreground cursor-pointer shrink-0"
            title="Alternar panel lateral"
          >
            <IconLayoutSidebar size={18} stroke={1.5} />
          </button>

          <button
            onClick={() => setActiveDirectory(null)}
            className={`hover:text-accent transition-colors flex items-center gap-2 ${
              !activeDirectoryId ? "text-muted-foreground font-bold" : ""
            }`}
            title="Root"
          >
            root
          </button>

          {breadcrumbs.map((crumb, index) => {
            const isLast = index === breadcrumbs.length - 1;

            return (
              <div key={crumb.id} className="flex items-center space-x-1 whitespace-nowrap">
                <IconChevronRight size={14} />

                {isLast ? (
                  <span
                    className="font-bold text-xs text-accent/80 tracking-widest truncate max-w-37.5 sm:max-w-37.5"
                    title={crumb.name}
                  >
                    {crumb.name.toUpperCase()}
                  </span>
                ) : (
                  <button
                    onClick={() => setActiveDirectory(crumb.id)}
                    className="hover:text-accent text-xs transition-colors tracking-widest truncate max-w-37.5 sm:max-w-50"
                    title={crumb.name}
                  >
                    {crumb.name.toUpperCase()}
                  </button>
                )}
              </div>
            );
          })}
        </nav>

        <Link
          href={`/${lang}/reprompt`}
          className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg text-xs font-bold hover:bg-primary/90 transition-all shadow-sm active:scale-95 shrink-0 ml-4 z-10"
        >
          <IconScanTraces size={16} />
          <span className="hidden sm:inline tracking-widest">Extractor</span>
        </Link>
      </div>

      {/* 🎛️ ESTADO 2: SELECCIÓN MASIVA */}
      <div
        className={`absolute inset-0 flex items-center justify-between w-full transition-all duration-300 ease-in-out ${
          hasSelection ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4 pointer-events-none"
        }`}
      >
        <div className="flex items-center gap-3">
          <button
            onClick={clearSelection}
            className="p-1.5 rounded-md hover:bg-muted text-muted-foreground transition-colors cursor-pointer"
            title="Cancelar selección"
          >
            <IconX size={20} stroke={2} />
          </button>
          <span className="font-bold text-sm text-foreground">
            {selectedPromptIds.length} seleccionados
          </span>
        </div>

        <div className="flex items-center gap-4 bg-background">
          {/* Opciones para mover (Mismo UI exacto que PromptCardActions) */}
          <div className="flex items-center gap-2">
            <label className="text-[10px] font-bold uppercase text-muted-foreground items-center gap-1.5 hidden sm:flex">
              <IconFolder size={12} /> Colección
            </label>
            <select
              className="bg-muted/50 text-xs p-2 rounded border border-border outline-none focus:ring-1 focus:ring-accent cursor-pointer min-w-32.5"
              onChange={(e) => {
                if (e.target.value !== "noop") {
                  const targetDir = e.target.value === "root" ? null : e.target.value;
                  moveBulkPrompts(selectedPromptIds, targetDir);
                  e.target.value = "noop"; // Reset visual
                }
              }}
            >
              <option value="noop">Mover a...</option>
              <option value="root">Suelto</option>
              {directories.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.name}
                </option>
              ))}
            </select>
          </div>

          <div className="w-px h-5 bg-border/50 hidden sm:block"></div>

          {/* Botón Borrar (Mismo estilo que PromptCardActions) */}
          <button
            onClick={() => {
              if (
                window.confirm(
                  `¿Estás seguro de que quieres eliminar estos ${selectedPromptIds.length} prompts permanentemente?`,
                )
              ) {
                deleteBulkPrompts(selectedPromptIds);
              }
            }}
            className="flex items-center gap-2 px-3 py-2 text-red-500 hover:bg-red-500/10 rounded-lg text-xs font-mono font-bold transition-all shadow-sm active:scale-95"
          >
            <IconTrash size={14} />
            <span className="hidden sm:inline tracking-widest">Eliminar</span>
          </button>
        </div>
      </div>
    </header>
  );
}
