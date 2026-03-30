"use client";

import * as React from "react";
import { IconSearch, IconLoader2 } from "@tabler/icons-react";

interface SearchTextInputProps {
  query: string;
  isLoading: boolean;
  onChange: (value: string) => void;
}

export function SearchTextInput({ query, isLoading, onChange }: SearchTextInputProps) {
  const inputRef = React.useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        e.key === "/" &&
        document.activeElement?.tagName !== "INPUT" &&
        document.activeElement?.tagName !== "TEXTAREA"
      ) {
        e.preventDefault();
        inputRef.current?.focus();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  return (
    <div className="flex-1 flex items-center relative group h-full">
      <input
        ref={inputRef}
        type="text"
        value={query}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Buscar prompts, estilos, modelos..."
        className="w-full h-full bg-transparent pl-3 pr-16 outline-none text-sm text-foreground placeholder:text-muted-foreground rounded-r-lg"
        disabled={isLoading}
      />

      <div className="absolute right-10 pointer-events-none hidden lg:flex items-center">
        <kbd className="h-5 px-1.5 flex items-center justify-center bg-muted border border-border rounded text-[10px] font-mono text-muted-foreground">
          /
        </kbd>
      </div>

      <button
        type="submit"
        disabled={isLoading}
        className="absolute right-0 h-full w-10 flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors disabled:opacity-50"
      >
        {isLoading ? (
          <IconLoader2 size={18} className="animate-spin" />
        ) : (
          <IconSearch size={18} stroke={1.5} />
        )}
      </button>
    </div>
  );
}
