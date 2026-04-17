"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  IconFolderPlus as FolderPlus,
  IconCloudUpload as UploadCloud,
  IconAlbum,
  IconChevronRight,
  IconLayoutGrid,
  IconFolder,
} from "@tabler/icons-react";
import { useStudioUI, Directory } from "@/src/store/useStudioUI";
import { SidebarDirectory } from "@/src/system/organisms/Studio/SidebarDirectory";
import PromptGrid from "@/src/system/organisms/Studio/PromptGrid";
import { usePromptExtractor } from "@/src/features/extractor/hooks/usePromptExtractor";
// 🟢 1. IMPORTAMOS LOS SENSORES
import {
  DndContext,
  DragEndEvent,
  DragStartEvent,
  closestCenter,
  DragOverlay,
  useSensor,
  useSensors,
  PointerSensor,
} from "@dnd-kit/core";
import { fetchSeguro } from "@/src/services/api/client";

export default function StudioPage() {
  const {
    directories,
    setDirectories,
    createDirectory,
    moveDirectory,
    activeDirectoryId,
    setActiveDirectory,
  } = useStudioUI();

  const { processFiles } = usePromptExtractor();
  const [activeDragDir, setActiveDragDir] = useState<Directory | null>(null);

  // 🟢 2. CONFIGURAMOS EL SENSOR (El truco mágico)
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8, // El ratón debe moverse 8px antes de que se considere "arrastre"
      },
    }),
  );

  useEffect(() => {
    const fetchDirs = async () => {
      try {
        const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";
        const res = await fetchSeguro(`${API_URL}/directories/`, { credentials: "include" });
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
    const name = window.prompt("Nombre de la nueva carpeta principal:");
    if (name && name.trim()) {
      await createDirectory(name.trim(), null);
    }
  };

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    if (active.data.current?.type === "directory") {
      setActiveDragDir(active.data.current.directory);
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    setActiveDragDir(null);
    const { active, over } = event;

    if (!over || active.id === `dir-${over.id}`) return;

    const draggedDirId = String(active.id).replace("dir-", "");
    const targetDirId = String(over.id);

    if (draggedDirId !== targetDirId) {
      moveDirectory(draggedDirId, targetDirId);
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-64px)] w-full bg-background p-4 md:p-6 lg:p-8 gap-4">
      {/* CABECERA (Sin cambios) */}
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

      {/* 🟢 3. AÑADIMOS LOS SENSORES AL CONTEXTO */}
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <div className="flex flex-1 overflow-hidden border-2 border-border rounded-xl neo-shadow bg-card">
          {/* Sidebar */}
          <aside className="w-72 border-r-2 border-border bg-muted/10 flex-col hidden md:flex">
            <div className="p-4 border-b-2 border-border flex items-center justify-between bg-card">
              <h2 className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
                Directorios
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

            <div className="flex-1 overflow-y-auto py-4 custom-scrollbar flex flex-col gap-1">
              {/* BOTÓN ROOT */}
              <div
                onClick={() => setActiveDirectory(null)}
                className={`
                  flex items-center py-2 px-3 mx-2 mb-2 rounded-md cursor-pointer transition-all duration-200 select-none
                  ${
                    activeDirectoryId === null
                      ? "bg-primary/10 text-primary font-bold neo-border border-primary/20"
                      : "text-foreground hover:bg-secondary/50 border border-transparent"
                  }
                `}
              >
                <IconLayoutGrid
                  size={18}
                  className={`mr-2 ${activeDirectoryId === null ? "text-primary" : "text-muted-foreground"}`}
                />
                <span className="text-sm truncate flex-1">Todas las imágenes</span>
              </div>

              <div className="mx-4 mb-3 border-b-2 border-border/50"></div>

              {/* Lista de Carpetas */}
              {directories
                .filter((d: Directory) => d.parent_id === null)
                .map((dir: Directory) => (
                  <SidebarDirectory key={dir.id} directory={dir} />
                ))}

              {directories.length === 0 && (
                <div className="px-6 py-10 text-center space-y-2">
                  <p className="text-xs text-muted-foreground italic font-mono">
                    Aún no tienes carpetas.
                  </p>
                </div>
              )}
            </div>
          </aside>

          {/* Main Grid */}
          <main className="flex-1 overflow-y-auto custom-scrollbar bg-background p-4 md:p-6">
            <PromptGrid />
          </main>
        </div>

        {/* EL FANTASMA (DragOverlay) */}
        <DragOverlay dropAnimation={null}>
          {activeDragDir ? (
            <div className="flex items-center py-2 px-3 bg-card border-2 border-primary border-dashed rounded-lg shadow-2xl opacity-90 cursor-grabbing">
              <IconFolder size={18} className="text-primary mr-2" />
              <span className="text-sm font-bold text-foreground">{activeDragDir.name}</span>
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>
    </div>
  );
}
