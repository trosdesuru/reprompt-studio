import { IconFilter } from "@tabler/icons-react";
import { Button } from "@/src/system/atoms/Button/Button";
import { Tooltip } from "../../atoms/Tooltip/Tooltip";

interface FeedHeaderProps {
  title?: string;
  count?: number;
  onFilterClick?: () => void;
  activeFilterCount?: number;
}

export function FeedHeader({ title = "", onFilterClick, activeFilterCount = 0 }: FeedHeaderProps) {
  return (
    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8 border-b border-border/50 pb-4">
      <div className="flex flex-col gap-1">
        <h2 className="text-xl md:text-2xl font-black font-mono uppercase tracking-widest flex items-center gap-2 text-foreground">
          {title}
        </h2>
      </div>

      <div className="flex items-center gap-2">
        <Tooltip content="Servicio en desarrollo" side="top">
          <Button
            variant={activeFilterCount > 0 ? "primary" : "secondary"}
            size="sm"
            onClick={onFilterClick}
            className="gap-2"
          >
            <IconFilter size={16} />
            Filtros
            {activeFilterCount > 0 && (
              <span className="bg-background text-foreground px-1.5 py-0.5 rounded-full text-[10px] leading-none flex items-center justify-center border border-border">
                {activeFilterCount}
              </span>
            )}
          </Button>
        </Tooltip>
      </div>
    </div>
  );
}
