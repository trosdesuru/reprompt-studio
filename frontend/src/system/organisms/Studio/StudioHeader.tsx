import Link from "next/link";
import { IconAlbum, IconChevronRight } from "@tabler/icons-react";

export function StudioHeader() {
  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center gap-2 text-sm text-muted-foreground font-mono">
        <Link href="/es" className="hover:text-primary transition-colors cursor-pointer">
          Inicio
        </Link>
        <IconChevronRight size={14} />
        <span className="text-foreground font-semibold">Mi Studio</span>
      </div>

      <div className="flex items-center gap-3">
        <div className="p-2 bg-primary/10 rounded-lg border border-primary/20 neo-shadow-sm">
          <IconAlbum className="text-primary" size={28} stroke={1.5} />
        </div>
        <div>
          <h1 className="text-2xl md:text-3xl font-black tracking-tight uppercase">Mi Studio</h1>
          <p className="text-muted-foreground text-sm font-mono mt-1">
            Gestiona y organiza tus extracciones
          </p>
        </div>
      </div>
    </div>
  );
}
