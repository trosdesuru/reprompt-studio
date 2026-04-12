import {
  IconUpload,
  IconFileText,
  IconPhoto,
  IconAlertCircle,
  IconFileZip,
  IconScanTraces,
  IconFolderStar,
  IconCloudUpload,
} from "@tabler/icons-react";

interface DropzoneContentProps {
  isDragActive: boolean;
  isDragReject: boolean;
}

export function DropzoneContent({ isDragActive, isDragReject }: DropzoneContentProps) {
  return (
    <div className="flex flex-col items-center justify-center w-full pt-12 pb-8 pointer-events-none">
      {/* 🎯 ZONA DE ACCIÓN PRINCIPAL */}
      <div
        className={`w-24 h-24 rounded-full flex items-center justify-center mb-6 transition-all duration-300 neo-border
          ${
            isDragReject
              ? "bg-destructive text-destructive-foreground scale-110"
              : isDragActive
                ? "bg-(--accent-color) text-white scale-110"
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
          <IconPhoto size={14} /> PNG, JPG
        </span>
        <span className="flex items-center gap-1.5 bg-background px-3 py-1.5 neo-border rounded-full shadow-sm">
          <IconFileZip size={14} /> Lotes .ZIP
        </span>
        <span className="flex items-center gap-1.5 bg-background px-3 py-1.5 neo-border rounded-full shadow-sm">
          <IconFileText size={14} /> .TXT / .JSON
        </span>
      </div>

      {/* 🚀 ONBOARDING (ANTES, DURANTE, DESPUÉS) */}
      <div
        className={`w-full max-w-3xl mt-12 pt-8 border-t border-border/50 grid grid-cols-1 md:grid-cols-3 gap-8 px-6 transition-opacity duration-500
          ${isDragActive || isDragReject ? "opacity-10" : "opacity-100"}
        `}
      >
        {/* Paso 1: Antes */}
        <div className="flex flex-col items-center text-center gap-2">
          <div className="p-2 bg-muted/10 rounded-lg neo-border mb-1 text-muted-foreground border-accent!">
            <IconCloudUpload className="text-accent!" size={20} />
          </div>
          <h4 className="font-bold text-xs uppercase tracking-widest text-foreground">1. Sube</h4>
          <p className="text-xs font-mono text-muted-foreground leading-relaxed">
            Arrastra tus imágenes generadas cono Midjourney, a1111 o ComiFy o un ZIP.
          </p>
        </div>

        {/* Paso 2: Durante */}
        <div className="flex flex-col items-center text-center gap-2">
          <div className="p-2 bg-muted/10 rounded-lg neo-border mb-1 border-accent!">
            <IconScanTraces className="text-accent!" size={20} />
          </div>
          <h4 className="font-bold text-xs uppercase tracking-widest text-foreground">2. Extrae</h4>
          <p className="text-xs font-mono text-muted-foreground leading-relaxed">
            Nuestra IA lee la Metadata oculta een la imagen.
          </p>
        </div>

        {/* Paso 3: Después */}
        <div className="flex flex-col items-center text-center gap-2">
          <div className="p-2 bg-muted/10 rounded-lg neo-border mb-1 border-accent!">
            <IconFolderStar className="text-accent!" size={20} />
          </div>
          <h4 className="font-bold text-xs uppercase tracking-widest text-foreground">
            3. Colecciona
          </h4>
          <p className="text-xs font-mono text-muted-foreground leading-relaxed">
            Guarda los prompts en tu Studio, reutiliza y gestiona.
          </p>
        </div>
      </div>
    </div>
  );
}
