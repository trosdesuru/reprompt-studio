export function Skeleton({ className = "" }: { className?: string }) {
  return <div className={`animate-pulse bg-(--border-color)/20 rounded ${className}`} />;
}
