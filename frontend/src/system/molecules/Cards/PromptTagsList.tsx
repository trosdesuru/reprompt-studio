"use client";

import { useState } from "react";
import { IconTag, IconChevronDown, IconChevronUp } from "@tabler/icons-react";
import { Tooltip } from "@/src/system/atoms/Tooltip/Tooltip";

interface TagItem {
  name: string;
  confidence: number;
}

export function PromptTagsList({ tags }: { tags?: (string | TagItem)[] }) {
  const [expanded, setExpanded] = useState(false);

  if (!tags || tags.length === 0) return null;

  const MAX_TAGS = 8;
  const hasManyTags = tags.length > MAX_TAGS;
  const tagsToShow = expanded ? tags : tags.slice(0, MAX_TAGS);

  return (
    <div className="space-y-3 pt-2 mb-6">
      <h3 className="font-mono text-xs font-black uppercase tracking-widest flex items-center gap-2 text-muted-foreground">
        <IconTag size={18} /> TAGS
      </h3>
      <div className="flex flex-wrap items-center gap-1.5">
        {tagsToShow.map((tagItem, idx) => {
          const isObject = typeof tagItem === "object" && tagItem !== null;
          const tagName = isObject ? (tagItem as TagItem).name : tagItem;
          const confidence = isObject ? (tagItem as TagItem).confidence : 100;

          if (!tagName) return null;

          return (
            <Tooltip
              key={tagName}
              content={
                <div className="flex flex-col gap-0.5">
                  <span className="text-destructive text-xs font-bold capitalize">{tagName}</span>
                  <span className="text-xs text-muted">Confianza: {confidence}%</span>
                </div>
              }
            >
              <div
                key={`${tagName}-${idx}`}
                title={`Coincidencia: ${confidence}%`}
                className="relative overflow-hidden inline-flex items-center px-2.5 py-1 text-primary text-[10px] font-bold uppercase tracking-wider rounded-md border border-primary/30 group cursor-default"
              >
                <div
                  className="absolute left-0 top-0 h-full bg-primary/20 group-hover:bg-primary/30 transition-colors z-0"
                  style={{ width: `${confidence}%` }}
                />
                <span className="relative z-10 pointer-events-none">{tagName as string}</span>
              </div>
            </Tooltip>
          );
        })}

        {hasManyTags && (
          <Tooltip content={expanded ? "Ver menos" : "Ver más"}>
            <button
              onClick={() => setExpanded(!expanded)}
              className="ml-1 p-1 rounded-full bg-muted/50 hover:bg-muted text-muted-foreground transition-colors"
            >
              {expanded ? <IconChevronUp size={14} /> : <IconChevronDown size={14} />}
            </button>
          </Tooltip>
        )}
      </div>
    </div>
  );
}
