"use client";

import { useState } from "react";
import { IconChevronDown, IconChevronUp } from "@tabler/icons-react";
import { Tooltip } from "@/src/system/atoms/Tooltip/Tooltip";

export function ExpandableTags({ tags }: { tags: string[] }) {
  const [isExpanded, setIsExpanded] = useState(false);

  if (!tags || tags.length === 0) return null;

  return (
    <div className="flex flex-col gap-3">
      <h3 className="text-xs font-mono font-bold text-muted-foreground uppercase tracking-widest">
        Etiquetas
      </h3>

      <div className="flex items-start gap-2">
        <div
          className={`flex flex-wrap gap-2 transition-all duration-500 ease-in-out overflow-hidden ${
            isExpanded ? "max-h-125" : "max-h-15"
          }`}
        >
          {tags.map((tag, idx) => (
            <span
              key={idx}
              className="px-3 py-1 bg-accent/10 text-accent border border-accent/20 rounded-md text-xs font-mono font-semibold"
            >
              {tag}
            </span>
          ))}
        </div>

        {tags.length > 5 && (
          <Tooltip content={isExpanded ? "Ocultar" : "Mostrar más"} side="top">
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="mt-1 p-1 rounded-full bg-background hover:bg-accent hover:text-white text-muted-foreground transition-colors shrink-0 cursor-pointer"
            >
              {isExpanded ? <IconChevronUp size={16} /> : <IconChevronDown size={16} />}
            </button>
          </Tooltip>
        )}
      </div>
    </div>
  );
}
