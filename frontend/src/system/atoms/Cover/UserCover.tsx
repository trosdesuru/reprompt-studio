"use client";

import { cn } from "@/lib/utils";

interface UserCoverProps {
  role?: string;
  coverUrl?: string | null;
  className?: string;
}

export function UserCover({ role = "voyager", coverUrl, className }: UserCoverProps) {
  const getRoleBackground = (userRole: string) => {
    switch (userRole.toLowerCase()) {
      case "artist":
        return "bg-artist/60";
      case "voyager":
        return "bg-foreground/60";
      case "admin":
        return "bg-destructive/90";
      default:
        return "bg-surface/40";
    }
  };

  return (
    <div className={cn("relative w-full h-full overflow-hidden bg-muted", className)}>
      {coverUrl ? (
        <img src={coverUrl} alt="User Cover" className="w-full h-full object-cover" />
      ) : (
        <div className={cn("relative w-full h-full", getRoleBackground(role))}>
          <div
            // 🟢 El único cambio: Bajamos a opacity-20 para que sea una textura muy sutil
            className="absolute inset-0 opacity-20 mix-blend-multiply dark:mix-blend-overlay pointer-events-none"
            style={{
              backgroundImage:
                "linear-gradient(var(--border) 1px, transparent 1px), linear-gradient(90deg, var(--border) 1px, transparent 1px)",
              backgroundSize: "24px 24px",
              // 🟢 LA MAGIA: Máscara que degrada la cuadrícula desde arriba (opaca) hacia abajo (transparente)
              WebkitMaskImage: "linear-gradient(to bottom, black 10%, transparent 90%)",
              maskImage: "linear-gradient(to bottom, black 10%, transparent 90%)",
            }}
          />
        </div>
      )}

      <div className="absolute inset-0 bg-black/15 pointer-events-none" />
    </div>
  );
}
