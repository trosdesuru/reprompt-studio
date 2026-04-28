"use client";

import { useState } from "react";
import { Button } from "@/src/system/atoms/Button/Button";

export function ExpandablePromptBox({ text }: { text: string }) {
  const [isExpanded, setIsExpanded] = useState(false);
  const isLongText = text.length > 150; 

  if (!text) return null;

  return (
    <div className="flex flex-col gap-2">
      <h3 className="text-xs font-mono font-bold text-muted-foreground uppercase tracking-widest">
        Prompt
      </h3>
      <div className="relative rounded-xl border border-border/40 bg-muted/10 p-4 transition-all duration-500 overflow-hidden">
        <p
          className={`font-mono text-sm leading-relaxed text-foreground/80 transition-all duration-500 ease-in-out ${
            isExpanded ? "line-clamp-none opacity-100" : "line-clamp-3 opacity-80"
          }`}
        >
          {text}
        </p>

        {!isExpanded && isLongText && (
          <div className="absolute bottom-0 left-0 right-0 h-10 bg-linear-to-t from-background/90 via-background/40 to-transparent pointer-events-none" />
        )}
      </div>

      {isLongText && (
        <Button
          variant="ghost"
          size="sm"
          className="self-start text-xs font-bold text-accent hover:text-accent/80 p-0 h-auto"
          onClick={() => setIsExpanded(!isExpanded)}
        >
          {isExpanded ? "- Ver menos" : "+ Leer prompt completo"}
        </Button>
      )}
    </div>
  );
}