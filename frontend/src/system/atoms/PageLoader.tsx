import { IconLoader2 } from "@tabler/icons-react";

interface PageLoaderProps {
  text?: string;
}

export function PageLoader({ text = "Cargando datos..." }: PageLoaderProps) {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4 text-muted-foreground w-full">
      <IconLoader2 size={32} className="animate-spin text-(--accent-color)" />

      <p className="font-mono text-sm uppercase tracking-widest animate-pulse">{text}</p>
    </div>
  );
}
