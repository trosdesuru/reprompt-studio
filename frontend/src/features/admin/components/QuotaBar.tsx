import { IconAlertTriangle } from "@tabler/icons-react";

interface QuotaBarProps {
  label: string;
  currentMb: number;
  limitMb: number;
}

export function QuotaBar({ label, currentMb, limitMb }: QuotaBarProps) {
  const percentage = Math.min(100, Math.max(0, (currentMb / limitMb) * 100));

  // Lógica de alerta visual
  let colorClass = "bg-green-500";
  if (percentage > 70) colorClass = "bg-yellow-500";
  if (percentage > 90) colorClass = "bg-red-500 animate-pulse";

  return (
    <div className="bg-background border border-border p-4 rounded-xl shadow-sm">
      <div className="flex justify-between items-end mb-2">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
            {label}
          </p>
          <div className="flex items-baseline gap-1 mt-1">
            <span className="text-2xl font-black text-foreground">{currentMb.toFixed(2)}</span>
            <span className="text-xs font-mono text-muted-foreground mb-1">
              / {limitMb.toLocaleString()} MB
            </span>
          </div>
        </div>
        <span className="text-xs font-mono font-bold">{percentage.toFixed(1)}%</span>
      </div>

      {/* La Barra de Progreso */}
      <div className="h-2 w-full bg-muted rounded-full overflow-hidden relative">
        <div
          className={`h-full rounded-full transition-all duration-1000 ease-out ${colorClass}`}
          style={{ width: `${percentage}%` }}
        />
      </div>

      {percentage > 90 && (
        <p className="text-[10px] text-red-500 mt-2 flex items-center gap-1 font-bold">
          <IconAlertTriangle size={12} /> PELIGRO DE COLAPSO DE CUOTA
        </p>
      )}
    </div>
  );
}
