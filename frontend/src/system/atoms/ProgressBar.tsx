interface ProgressBarProps {
  /** Valor del 0 al 100 */
  value: number;
  /** Texto opcional que aparece encima de la barra */
  label?: string;
  /** Mostrar el porcentaje numérico a la derecha */
  showPercentage?: boolean;
  /** Activa la animación de franjas diagonales tipo Mantine */
  animated?: boolean;
  /** Clases extra para el contenedor principal */
  className?: string;
  /** Altura de la barra (por defecto h-6) */
  size?: "sm" | "md" | "lg";
}

export function ProgressBar({
  value,
  label,
  showPercentage = true,
  animated = false,
  className = "",
  size = "md",
}: ProgressBarProps) {
  // Asegurarnos de que el valor siempre esté entre 0 y 100
  const clampedValue = Math.min(100, Math.max(0, value));

  // Tamaños predefinidos
  const sizeClasses = {
    sm: "h-3",
    md: "h-6",
    lg: "h-10 text-lg",
  };

  return (
    <div className={`flex flex-col gap-1.5 w-full ${className}`}>
      {/* Cabecera: Etiqueta y Porcentaje */}
      {(label || showPercentage) && (
        <div className="flex justify-between items-end font-mono text-xs font-black uppercase text-(--text-secondary)">
          {label ? <span>{label}</span> : <span />}
          {showPercentage && <span>{Math.round(clampedValue)}%</span>}
        </div>
      )}

      {/* Contenedor de la barra (Estilo Neo-Brutalista) */}
      <div
        className={`w-full bg-(--bg-secondary) neo-border relative overflow-hidden ${sizeClasses[size]}`}
      >
        {/* Relleno de la barra */}
        <div
          className={`h-full bg-(--accent-color) border-r-2 border-white transition-all duration-500 ease-out relative overflow-hidden`}
          style={{ width: `${clampedValue}%` }}
        >
          {/* El truco mágico: Franjas animadas con puro CSS de Tailwind */}
          {animated && (
            <div
              className="absolute inset-0 opacity-20"
              style={{
                backgroundImage:
                  "linear-gradient(45deg, rgba(255,255,255,0.15) 25%, transparent 25%, transparent 50%, rgba(255,255,255,0.15) 50%, rgba(255,255,255,0.15) 75%, transparent 75%, transparent)",
                backgroundSize: "1rem 1rem",
                animation: "progress-stripes 1s linear infinite",
              }}
            />
          )}
        </div>
      </div>
    </div>
  );
}
