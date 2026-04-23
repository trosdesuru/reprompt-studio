interface PageLoaderProps {
  text?: string;
}

export function PageLoader({ text = "Procesando petición..." }: PageLoaderProps) {
  return (
    <div className="min-h-[60vh] flex items-center justify-center w-full bg-background">
      <p
        className="font-mono text-sm tracking-widest
                   bg-linear-to-r from-zinc-600/40 via-zinc-100 to-zinc-600/40
                   bg-size-[250%_auto]
                   bg-clip-text text-transparent
                   animate-ai-shimmer"
      >
        {text}
      </p>
    </div>
  );
}
