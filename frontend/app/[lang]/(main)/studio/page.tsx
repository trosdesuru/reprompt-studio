"use client";

import { useEffect } from "react";
import {
  IconSearch as Search,
  IconFolderPlus as FolderPlus,
  IconCloudUpload as UploadCloud,
} from "@tabler/icons-react";
import { useStudioUI, Directory } from "@/src/store/useStudioUI";
import { SidebarDirectory } from "@/src/system/organisms/Studio/SidebarDirectory";
import PromptGrid from "@/src/system/organisms/Studio/PromptGrid";
import { usePromptExtractor } from "@/src/features/extractor/hooks/usePromptExtractor";

// 🟢 NUEVOS IMPORTS DE DND
import { DndContext, DragEndEvent, closestCenter } from "@dnd-kit/core";

export default function StudioPage() {
  const {
    directories,
    setDirectories,
    searchQuery,
    setSearchQuery,
    createDirectory,
    moveDirectory,
  } = useStudioUI();

  const { processFiles } = usePromptExtractor();

  useEffect(() => {
    const fetchDirs = async () => {
      try {
        const res = await fetch("/api/directories");
        if (res.ok) {
          const data = await res.json();
          setDirectories(data);
        }
      } catch (error) {
        console.error("Error cargando directorios:", error);
      }
    };
    fetchDirs();
  }, [setDirectories]);

  const handleUploadClick = () => {
    const input = document.createElement("input");
    input.type = "file";
    input.multiple = true;
    input.onchange = (e) => {
      const files = (e.target as HTMLInputElement).files;
      if (files) processFiles(Array.from(files));
    };
    input.click();
  };

  const handleCreateRootFolder = async () => {
    const name = prompt("Nombre de la nueva carpeta principal:");
    if (name && name.trim()) {
      await createDirectory(name.trim(), null);
    }
  };

  // 🟢 LÓGICA DE FIN DE ARRASTRE
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    // Si soltamos en la nada, o sobre sí misma, cancelamos
    if (!over || active.id === `dir-${over.id}`) return;

    const draggedDirId = String(active.id).replace("dir-", "");
    const targetDirId = String(over.id);

    // Mover la carpeta
    if (draggedDirId !== targetDirId) {
      moveDirectory(draggedDirId, targetDirId);
    }
  };

  return (
    <DndContext collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
      <div className="flex h-[calc(100vh-64px)] bg-background">
        <aside className="w-72 border-r bg-card/30 backdrop-blur-sm flex flex-col">
          <div className="p-4 border-b space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
                Mi Studio
              </h2>
              <div className="flex gap-1">
                <button
                  onClick={handleCreateRootFolder}
                  className="p-1.5 hover:bg-secondary rounded-lg transition-colors"
                  title="Nueva Carpeta Principal"
                >
                  <FolderPlus size={18} stroke={1.5} />
                </button>
                <button
                  onClick={handleUploadClick}
                  className="p-1.5 hover:bg-secondary rounded-lg text-primary transition-colors"
                  title="Subir Imágenes"
                >
                  <UploadCloud size={18} stroke={1.5} />
                </button>
              </div>
            </div>

            <div className="relative group">
              <Search
                className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground transition-colors group-focus-within:text-primary"
                size={16}
                stroke={1.5}
              />
              <input
                type="text"
                placeholder="Búsqueda semántica..."
                className="w-full bg-secondary/50 border border-transparent rounded-full py-2 pl-9 pr-4 text-xs focus:bg-background focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto py-4 custom-scrollbar">
            {directories
              .filter((d: Directory) => d.parent_id === null)
              .map((dir: Directory) => (
                <SidebarDirectory key={dir.id} directory={dir} />
              ))}

            {directories.length === 0 && (
              <div className="px-6 py-10 text-center space-y-2">
                <p className="text-xs text-muted-foreground italic">
                  Aún no tienes carpetas.
                  <br />
                  Haz clic en el icono + para empezar.
                </p>
              </div>
            )}
          </div>
        </aside>

        <main className="flex-1 overflow-y-auto custom-scrollbar bg-accent/5">
          <div className="max-w-7xl mx-auto p-6 h-full">
            <PromptGrid />
          </div>
        </main>
      </div>
    </DndContext>
  );
}
