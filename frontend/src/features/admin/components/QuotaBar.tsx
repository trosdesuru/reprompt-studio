"use client";

import { cn } from "@/lib/utils";

interface QuotaBarProps {
  used: number;
  limit: number;
  label: string;
  className?: string;
}

export function QuotaBar({ used, limit, label, className }: QuotaBarProps) {
  const isInfinite = limit === null || limit === -1 || limit === Infinity;
  const percentage = isInfinite ? 0 : Math.min((used / limit) * 100, 100);

  const isCritical = percentage >= 90;
  const isWarning = percentage >= 70 && percentage < 90;

  return (
    <div className={cn("space-y-2", className)}>
      <div className="flex justify-between items-end">
        <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-muted-foreground">
          {label}
        </span>
        <span className="text-[10px] font-mono font-bold">
          {isInfinite ? `${used} / ∞` : `${used} / ${limit}`}
        </span>
      </div>

      <div className="h-2 w-full bg-muted rounded-full overflow-hidden border border-border/50">
        <div
          className={cn(
            "h-full transition-all duration-500 ease-out",
            isCritical ? "bg-red-500" : isWarning ? "bg-orange-500" : "bg-(--accent-color)",
          )}
          style={{ width: `${isInfinite ? 5 : percentage}%` }}
        />
      </div>

      {isCritical && !isInfinite && (
        <p className="text-[9px] font-mono font-bold text-red-500 animate-pulse uppercase">
          ⚠️ Espacio casi agotado. Borra prompts o mejora tu plan.
        </p>
      )}
    </div>
  );
}
