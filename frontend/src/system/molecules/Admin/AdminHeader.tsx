export function AdminHeader({ username }: { username: string }) {
  return (
    <header className="border-b-4 border-border pb-6">
      <h1 className="text-4xl md:text-6xl font-black font-mono uppercase italic tracking-tighter">
        Admin<span className="text-(--accent-color)">_</span>Terminal
      </h1>
      <p className="text-muted-foreground font-mono text-sm mt-2">
        Acceso concedido a: <span className="text-foreground font-bold">@{username}</span> [ROOT_ACCESS]
      </p>
    </header>
  );
}
