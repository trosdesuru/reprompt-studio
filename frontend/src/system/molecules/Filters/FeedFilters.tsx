import { IconEye, IconEyeOff } from "@tabler/icons-react";

interface FeedFiltersProps {
  showMyArt: boolean;
  onToggleMyArt: () => void;
}

export function FeedFilters({ showMyArt, onToggleMyArt }: FeedFiltersProps) {
  return (
    <div className="flex items-center justify-end mb-6">
      <button
        onClick={onToggleMyArt}
        className={`flex items-center gap-2 px-3 py-1.5 text-xs font-mono font-bold uppercase tracking-wider rounded-md transition-all neo-border ${
          showMyArt
            ? "bg-(--accent-color) text-white neo-shadow-accent"
            : "bg-muted/10 text-muted-foreground hover:bg-muted/20"
        }`}
      >
        {showMyArt ? <IconEye size={16} /> : <IconEyeOff size={16} />}
        {showMyArt ? "Ocultar mi arte" : "Mostrar mi arte"}
      </button>
    </div>
  );
}
