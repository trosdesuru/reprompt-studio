export function AdminLoadingScreen() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background">
      <div className="w-10 h-10 border-4 border-accent border-t-transparent rounded-full animate-spin mb-4" />
      <p className="font-mono text-xs uppercase tracking-[0.2em] text-muted-foreground animate-pulse">
        Accediendo al Terminal Maestro...
      </p>
    </div>
  );
}
