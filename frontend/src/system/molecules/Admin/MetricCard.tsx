export function MetricCard({ title, value, icon }: { title: string; value: string | number; icon: React.ReactNode }) {
  return (
    <div className="bg-background border border-border p-5 rounded-xl shadow-sm flex items-center justify-between hover:shadow-md transition-shadow">
      <div>
        <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-1">{title}</p>
        <p className="text-3xl font-black text-foreground">{value}</p>
      </div>
      <div className="p-3 bg-muted/30 rounded-lg">
        {icon}
      </div>
    </div>
  );
}
