import { IconWand } from "@tabler/icons-react";

export function DropzoneLoading() {
  return (
    <div className="relative w-full flex flex-col items-center justify-center min-h-400px neo-border overflow-hidden bg-muted/5">
      <div className="absolute inset-0 opacity-10 bg-[linear-gradient(110deg,#000,45%,#fff,55%,#000)] bg-length:200%_100% animate-ai-shimmer dark:bg-[linear-gradient(110deg,#fff,45%,#000,55%,#fff)]" />

      <IconWand size={64} className="text-(--accent-color) animate-spin relative z-10" />
      <h2 className="text-xl md:text-2xl font-black font-mono uppercase mt-6 relative z-10 tracking-widest text-center">
        Analizando ADN de la IA...
      </h2>
      <p className="text-muted-foreground font-mono mt-2 relative z-10 text-sm text-center">
        Extrayendo metadatos y decodificando parámetros
      </p>
    </div>
  );
}
