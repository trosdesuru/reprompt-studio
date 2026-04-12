export function MetricWidget({ count, label }: { count: number; label: string }) {
  return (
    <div className="bg-muted/10 p-6 border border-border shadow-sm rounded-xl flex flex-col items-center justify-center text-center">
      <span className="text-7xl font-black font-mono text-(--accent-color)">{count}</span>
      <span className="text-[10px] font-bold uppercase tracking-widest mt-2 opacity-60">
        {label}
      </span>
    </div>
  );
}
