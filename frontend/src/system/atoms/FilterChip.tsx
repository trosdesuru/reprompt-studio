import { cn } from "@/src/utils/lib/cn";

interface FilterChipProps {
  label: string;
  isActive: boolean;
  onClick: () => void;
}

export function FilterChip({ label, isActive, onClick }: FilterChipProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "px-4 py-1.5 rounded-full text-xs font-bold transition-all border whitespace-nowrap",
        isActive
          ? "bg-(--accent-color) border-(--accent-color) text-white shadow-[0_0_10px_rgba(var(--accent-color-rgb),0.3)]"
          : "bg-muted/50 border-border text-muted-foreground hover:border-foreground/30",
      )}
    >
      {label}
    </button>
  );
}
