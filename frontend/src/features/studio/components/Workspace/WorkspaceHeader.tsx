"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useStudioUI } from "@/src/store/useStudioUI";
import { IconChevronRight, IconScanTraces, IconLayoutSidebar } from "@tabler/icons-react";

export function WorkspaceHeader() {
  const { lang } = useParams();
  const { activeDirectoryId, setActiveDirectory, getBreadcrumbs, toggleSidebar } = useStudioUI();
  const breadcrumbs = getBreadcrumbs();

  return (
    <header className="flex items-center justify-between w-full mb-6 pb-4 border-b border-border/30">
      <nav
        aria-label="Breadcrumb"
        className="flex items-center space-x-1 text-xs md:text-sm font-mono text-accent/40 lowcase overflow-x-auto scrollbar-none"
      >
        <button
          onClick={toggleSidebar}
          className="p-1.5 rounded-md hover:bg-secondary/20 hover:text-accent transition-colors text-muted-foreground cursor-pointer hrink-0"
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
        className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg text-xs font-bold hover:bg-primary/90 transition-all shadow-sm active:scale-95 shrink-0 ml-4"
      >
        <IconScanTraces size={16} />
        <span className="hidden sm:inline tracking-widest">Extractor</span>
      </Link>
    </header>
  );
}
