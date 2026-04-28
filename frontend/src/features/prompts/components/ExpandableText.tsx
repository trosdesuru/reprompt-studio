"use client";

import { useState } from "react";
import { Button } from "@/src/system/atoms/Button/Button";
import { cn } from "@/lib/utils";

interface ExpandableTextProps {
  text: string;
  className?: string;
  gradientFrom?: string;
}

export function ExpandableText({
  text,
  className,
  gradientFrom = "from-(--bg-secondary)",
}: ExpandableTextProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const isLongText = text.length > 150;

  if (!text) return <span className="italic opacity-50">No hay contenido registrado.</span>;

  return (
    <div className="relative flex flex-col gap-2 w-full">
      <div className="relative overflow-hidden transition-all duration-300">
        <p
          className={cn(
            "font-mono text-sm leading-relaxed whitespace-pre-wrap transition-all",
            !isExpanded && isLongText ? "line-clamp-3 opacity-80" : "line-clamp-none opacity-100",
            className,
          )}
        >
          {text}
        </p>

        {!isExpanded && isLongText && (
          <div
            className={cn(
              "absolute bottom-0 left-0 right-0 h-8 bg-linear-to-t to-transparent pointer-events-none",
              gradientFrom,
            )}
          />
        )}
      </div>

      {isLongText && (
        <Button
          variant="secondary"
          size="sm"
          onClick={() => setIsExpanded(!isExpanded)}
        >
          {isExpanded ? "- Ver menos" : "+ Ver más"}
        </Button>
      )}
    </div>
  );
}
