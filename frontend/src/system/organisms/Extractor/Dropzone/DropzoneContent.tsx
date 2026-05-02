import { Tooltip } from "@/src/system/atoms/Tooltip/Tooltip";
import {
  IconUpload,
  IconAlertCircle,
  IconPhoto,
  IconFileZip,
  IconFileText,
  IconCloudUpload,
  IconScanTraces,
  IconFolderStar,
  IconInfoCircle,
} from "@tabler/icons-react";

interface DropzoneContentProps {
  isDragActive: boolean;
  isDragReject: boolean;
  onOpenInfo: () => void;
}

export function DropzoneContent({ isDragActive, isDragReject, onOpenInfo }: DropzoneContentProps) {
  return (
    <div className="flex flex-col items-center justify-center w-full pt-12 pb-8 pointer-events-none">
      {/* 🟢 Botón de Info: Usamos pointer-events-auto para que sea clickable */}
      <Tooltip content="Información">
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation(); // 🟢 Crucial: evita que se abra el selector de archivos al clicar la info
            onOpenInfo();
          }}
          className="absolute top-6 right-6 p-2 text-muted-foreground hover:text-accent transition-colors pointer-events-auto z-30 cursor-pointer"
        >
          <IconInfoCircle size={24} stroke={1.5} className="text-accent" />
        </button>
      </Tooltip>

      <div
        className={`w-24 h-24 rounded-full flex items-center justify-center mb-6 transition-all duration-300 neo-border
          ${
            isDragReject
              ? "bg-destructive text-destructive-foreground scale-110"
              : isDragActive
                ? "bg-accent text-white scale-110"
                : "bg-background text-muted-foreground group-hover:text-foreground group-hover:scale-105"
          }`}
      >
        {isDragReject ? (
          <IconAlertCircle size={40} stroke={1.5} />
        ) : (
          <IconUpload size={40} stroke={1.5} className={isDragActive ? "animate-bounce" : ""} />
        )}
      </div>

      <h2 className="text-2xl md:text-3xl font-black font-mono uppercase mb-2 text-center px-4 tracking-tighter">
        {isDragReject ? (
          <span className="text-destructive">¡Formato Inválido!</span>
        ) : isDragActive ? (
          "¡Suéltalo ahora!"
        ) : (
          "Arrastra tus archivos aquí"
        )}
      </h2>

      <p className="text-muted-foreground font-mono text-sm max-w-md text-center px-6 mb-6">
        {isDragReject
          ? "Solo aceptamos imágenes, textos o zips."
          : "o haz clic para explorar tu equipo"}
      </p>

      {/* Píldoras de formato */}
      <div className="flex flex-wrap justify-center gap-3 text-[10px] font-mono text-muted-foreground uppercase tracking-widest font-bold">
        <span className="flex items-center gap-1.5 bg-background px-3 py-1.5 neo-border rounded-full shadow-sm">
          <IconPhoto size={14} /> Imagen
        </span>
        <span className="flex items-center gap-1.5 bg-background px-3 py-1.5 neo-border rounded-full shadow-sm">
          <IconFileZip size={14} /> Lotes .ZIP
        </span>
        <span className="flex items-center gap-1.5 bg-background px-3 py-1.5 neo-border rounded-full shadow-sm">
          <IconFileText size={14} /> .TXT / .JSON
        </span>
      </div>

      {/* Footer informativo */}
      <div
        className={`w-full max-w-3xl mt-12 pt-8 border-t border-border/50 grid grid-cols-1 md:grid-cols-3 gap-8 px-6 transition-opacity duration-500
          ${isDragActive || isDragReject ? "opacity-10" : "opacity-100"}
        `}
      >
        <StepItem
          icon={<IconCloudUpload size={20} />}
          step="Sube"
          desc="Tus imágenes con metadata o un archivo ZIP."
        />
        <StepItem
          icon={<IconScanTraces size={20} />}
          step="Extrae"
          desc="Leemos el ADN de la IA automáticamente."
        />
        <StepItem
          icon={<IconFolderStar size={20} />}
          step="Guarda"
          desc="Organiza tus prompts en tu Studio personal."
        />
      </div>
    </div>
  );
}

// Sub-componente interno para limpiar el código
function StepItem({ icon, step, desc }: { icon: React.ReactNode; step: string; desc: string }) {
  return (
    <div className="flex flex-col items-center text-center gap-2">
      <div className="p-2 bg-muted/10 rounded-lg neo-border mb-1 text-accent border-accent/70!">
        {icon}
      </div>
      <h4 className="font-bold text-xs uppercase tracking-widest text-foreground">{step}</h4>
      <p className="text-xs font-mono text-muted-foreground leading-relaxed">{desc}</p>
    </div>
  );
}
