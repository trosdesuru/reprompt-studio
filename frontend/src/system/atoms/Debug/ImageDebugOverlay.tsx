import { getExactAspectRatio } from "@/src/utils/lib/_media";

interface ImageDebugOverlayProps {
  id: string | number;
  width?: number | null;
  height?: number | null;
  resolution?: string | null;
}

export function ImageDebugOverlay({ id, width, height, resolution }: ImageDebugOverlayProps) {
  // Solo mostramos esto en desarrollo
  if (process.env.NODE_ENV !== "development") return null;

  const ratio = getExactAspectRatio(width, height, resolution);
  const mathRatio = (ratio).toFixed(2);

  // Análisis de salud de los datos
  const isHealthy = width && height;
  const isRescued = (!width || !height) && resolution;
  const isFallback = !width && !height && !resolution;

  return (
    <div className="absolute top-0 left-0 w-full h-full pointer-events-none z-50 p-2 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-start">
      <div className="bg-black/80 backdrop-blur-md border border-white/20 rounded-md p-2 text-[10px] font-mono text-green-400 shadow-xl flex flex-col gap-1">
        <div className="text-white border-b border-white/20 pb-1 mb-1 font-bold">
          📡 TELEMETRÍA IMG
        </div>
        
        <div className="flex justify-between">
          <span className="text-muted-foreground">ID:</span>
          <span className="text-white truncate max-w-20">{id}</span>
        </div>

        <div className="flex justify-between">
          <span className="text-muted-foreground">DB WxH:</span>
          <span className={isHealthy ? "text-green-400" : "text-red-400"}>
            {width || "null"} x {height || "null"}
          </span>
        </div>

        <div className="flex justify-between">
          <span className="text-muted-foreground">DB Res:</span>
          <span className={isRescued ? "text-yellow-400" : "text-white"}>
            {resolution || "null"}
          </span>
        </div>

        <div className="border-t border-white/20 mt-1 pt-1 flex justify-between font-bold">
          <span className="text-white">Ratio Calc:</span>
          <span className={isFallback ? "text-red-500" : "text-cyan-400"}>
            {mathRatio}
          </span>
        </div>

        <div className="mt-1 flex gap-1">
          {isHealthy && <span className="bg-green-500/20 text-green-500 px-1 rounded">SANO</span>}
          {isRescued && <span className="bg-yellow-500/20 text-yellow-500 px-1 rounded">RESCATE</span>}
          {isFallback && <span className="bg-red-500/20 text-red-500 px-1 rounded">FALLBACK</span>}
        </div>
      </div>
    </div>
  );
}