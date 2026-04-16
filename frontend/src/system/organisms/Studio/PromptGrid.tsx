"use client";

import { useStudioUI } from "@/src/store/useStudioUI";
import { IconPhotoOff, IconWand } from "@tabler/icons-react";

export default function PromptGrid() {
  const { activeDirectoryId, directories, searchQuery } = useStudioUI();

  const currentDir = directories.find((d) => d.id === activeDirectoryId);

  let headerTitle = "Mi Studio";
  let headerSubtitle = "Selecciona una carpeta o busca una imagen para empezar.";

  if (searchQuery) {
    headerTitle = `Buscando: "${searchQuery}"`;
    headerSubtitle = "Resultados de la búsqueda vectorial por IA.";
  } else if (currentDir) {
    headerTitle = currentDir.name;
    headerSubtitle = "Gestiona las imágenes de esta carpeta.";
  }

  return (
    <div className="h-full flex flex-col animate-in fade-in duration-500">
      <div className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight">{headerTitle}</h1>
        <p className="text-sm text-muted-foreground mt-1">{headerSubtitle}</p>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center border-2 border-dashed border-border/60 rounded-2xl bg-card/10 backdrop-blur-sm">
        <div className="p-4 bg-secondary/50 rounded-full mb-4">
          <IconPhotoOff size={32} className="text-muted-foreground" stroke={1.5} />
        </div>
        <h3 className="text-lg font-medium">Esta vista está vacía</h3>
        <p className="text-sm text-muted-foreground mt-2 text-center max-w-sm">
          Aún no hemos conectado las imágenes de la base de datos a esta carpeta.
        </p>

        <div className="mt-6 flex items-center text-xs text-primary/60 bg-primary/10 px-3 py-1.5 rounded-full">
          <IconWand size={14} className="mr-1.5" />
          Fase de cuadrícula en construcción
        </div>
      </div>
    </div>
  );
}
