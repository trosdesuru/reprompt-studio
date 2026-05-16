"use client";

import { IconChevronRight, IconLayoutSidebar } from "@tabler/icons-react";

interface WorkspaceBreadcrumbsProps {
  activeDirectoryId: string | null;
  breadcrumbs: { id: string; name: string }[];
  onToggleSidebar: () => void;
  onSetActiveDirectory: (id: string | null) => void;
}

export function WorkspaceBreadcrumbs({
  activeDirectoryId,
  breadcrumbs,
  onToggleSidebar,
  onSetActiveDirectory,
}: Readonly<WorkspaceBreadcrumbsProps>) {
  return (
    <nav
      aria-label="Breadcrumb"
      className="flex items-center space-x-1 text-xs md:text-sm font-mono text-accent/40 lowercase overflow-x-auto scrollbar-none"
    >
      <button
        onClick={onToggleSidebar}
        className="p-1.5 rounded-md hover:bg-secondary/20 hover:text-accent transition-colors text-muted-foreground cursor-pointer shrink-0"
        title="Alternar panel lateral"
      >
        <IconLayoutSidebar size={18} stroke={1.5} />
      </button>

      <button
        onClick={() => onSetActiveDirectory(null)}
        className={`hover:text-accent transition-colors flex items-center gap-2 cursor-pointer ${
          activeDirectoryId ? "text-muted-foreground/50 font-bold" : ""
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
                onClick={() => onSetActiveDirectory(crumb.id)}
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
  );
}
