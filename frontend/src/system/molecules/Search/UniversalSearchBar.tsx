// src/system/molecules/Search/UniversalSearchBar.tsx
"use client";

import { useRef, useEffect } from "react";
import { IconSearch, IconLoader2, IconX } from "@tabler/icons-react";

interface UniversalSearchBarProps {
  query: string;
  isLoading: boolean;
  placeholder?: string;
  onQueryChange: (q: string) => void;
  onSubmit: () => void;
  onClear: () => void;
  enableKeyboardShortcut?: boolean;
}

export function UniversalSearchBar({
  query,
  isLoading,
  placeholder = "Buscar...",
  onQueryChange,
  onSubmit,
  onClear,
  enableKeyboardShortcut = false,
}: UniversalSearchBarProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!enableKeyboardShortcut) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      const isInput =
        target.tagName === "INPUT" || target.tagName === "TEXTAREA" || target.isContentEditable;
      if (e.key === "/" && !isInput) {
        e.preventDefault();
        inputRef.current?.focus();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [enableKeyboardShortcut]);

  return (
    <div className="relative flex items-center w-full h-10 bg-muted/20 border border-border/40 rounded-xl focus-within:border-(--accent-color)/50 focus-within:ring-1 focus-within:ring-(--accent-color)/20 transition-all backdrop-blur-sm">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          onSubmit();
        }}
        className="flex-1 h-full flex items-center relative pl-3"
      >
        <div className="flex items-center justify-center w-5 h-5">
          {isLoading ? (
            <IconLoader2 size={16} className="animate-spin text-(--accent-color)" />
          ) : (
            <IconSearch size={16} className="text-muted-foreground/60" />
          )}
        </div>

        <input
          ref={inputRef}
          value={query}
          onChange={(e) => onQueryChange(e.target.value)}
          className="w-full h-full bg-transparent px-3 text-sm outline-none placeholder:text-muted-foreground/40 font-medium"
          placeholder={placeholder}
        />

        {query && (
          <button
            type="button"
            onClick={onClear}
            className="pr-3 text-muted-foreground/40 hover:text-foreground transition-colors"
          >
            <IconX size={14} />
          </button>
        )}
      </form>
    </div>
  );
}
