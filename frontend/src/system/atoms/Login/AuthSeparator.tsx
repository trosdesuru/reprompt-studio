export function AuthSeparator() {
  return (
    <div className="relative flex items-center py-4">
      <div className="grow border-t border-border"></div>
      <span className="shrink-0 mx-4 text-xs font-mono text-muted-foreground uppercase tracking-widest">
        O con email
      </span>
      <div className="grow border-t border-border"></div>
    </div>
  );
}
