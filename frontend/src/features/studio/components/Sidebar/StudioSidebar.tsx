// En src/features/studio/components/StudioSidebar.tsx
"use client";

import { useEffect } from "react"; // 🟢 Importamos useEffect para los logs limpios
import { IconFolderPlus, IconCloudUpload, IconFolder } from "@tabler/icons-react";
import { useStudioUI, Directory } from "@/src/store/useStudioUI";
import { useFileUploader } from "@/src/features/extractor/hooks/useFileUploader";
import { useDirectoryActions } from "@/src/features/studio/hooks/useDirectoryActions";
import { useDroppable } from "@dnd-kit/core";

import {
  SidebarContainer,
  SidebarDivider,
  getSidebarItemClasses,
} from "@/src/system/organisms/Sidebar";
import { SidebarDirectory } from "@/src/system/molecules/Studio/SidebarDirectory";

export function StudioSidebar() {
  const { directories, activeDirectoryId, setActiveDirectory } = useStudioUI();
  const { isSidebarOpen, setSidebarOpen } = useStudioUI();
  const { createDirectory } = useDirectoryActions();
  const { handleUploadClick } = useFileUploader();

  // 🟢 TELEMETRÍA: Nos avisará cada vez que el estado cambie
  useEffect(() => {
    console.log(
      `👁️ [StudioSidebar] -> Renderizado completado. isSidebarOpen es ahora: ${isSidebarOpen}`,
    );
  }, [isSidebarOpen]);

  const { setNodeRef: setRootDropRef, isOver: isRootOver } = useDroppable({
    id: "root-zone",
    data: { type: "root" },
  });

  const handleCreateRootFolder = async (e: React.MouseEvent) => {
    e.stopPropagation();
    const name = window.prompt("Nombre de la nueva carpeta principal:");
    if (name?.trim()) await createDirectory(name.trim(), null);
  };

  const isRootActive = activeDirectoryId === null;

  return (
    <>
      {isSidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-background/60 backdrop-blur-sm md:hidden"
          onClick={() => {
            console.log(
              "🖱️ [StudioSidebar Overlay] -> Clic fuera del sidebar (Móvil), cerrando...",
            );
            setSidebarOpen(false);
          }}
          aria-hidden="true"
        />
      )}

      <aside
        className={`
          transition-all duration-300 ease-in-out z-50 shrink-0 h-full
          
          /* 📱 COMPORTAMIENTO MÓVIL (< 768px): 
             Fondo sólido (CRÍTICO), borde derecho, y ancho fijo base */
          bg-background border-r border-border/30 w-65
          absolute left-0 top-0 
          ${isSidebarOpen ? "translate-x-0 shadow-2xl" : "-translate-x-full shadow-none"}
          
          /* 💻 COMPORTAMIENTO DESKTOP (>= 768px): 
             Fondo transparente, sin bordes (se integra en el Workspace), posición relativa */
          md:bg-transparent md:border-none md:relative md:translate-x-0
          ${isSidebarOpen ? "md:w-65 md:opacity-100" : "md:w-0 md:opacity-0 md:overflow-hidden"}
        `}
      >
        {/* 🟢 CORRECCIÓN CRÍTICA DE TAILWIND AQUÍ ABAJO (De w-65 a w-[260px]) */}
        <div className="w-65 h-full flex flex-col">
          <SidebarContainer>
            <div className="px-3 mb-1 group relative mt-2 md:mt-0">
              <div
                ref={setRootDropRef}
                onClick={() => {
                  setActiveDirectory(null);
                  if (window.innerWidth < 768) setSidebarOpen(false);
                }}
                role="button"
                className={getSidebarItemClasses(isRootActive, isRootOver)}
              >
                <IconFolder size={18} stroke={1.5} />
                <span className="tracking-widest flex-1 text-left text-xs">
                  <span className="font-mono font-medium lowercase text-foreground/70">
                    reprompt
                  </span>{" "}
                  root
                </span>

                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={handleCreateRootFolder}
                    className="p-1 hover:bg-primary/20 rounded text-primary/80 transition-colors"
                    title="Nueva carpeta en Root"
                  >
                    <IconFolderPlus size={14} stroke={2} />
                  </button>
                  <button
                    onClick={handleUploadClick}
                    className="p-1 hover:bg-primary/20 rounded text-primary/80 transition-colors"
                    title="Subir a Root"
                  >
                    <IconCloudUpload size={14} stroke={2} />
                  </button>
                </div>
              </div>
            </div>

            <SidebarDivider />

            <div className="px-3 flex flex-col gap-1">
              {directories
                .filter((d: Directory) => d.parent_id === null)
                .map((dir: Directory) => (
                  <SidebarDirectory key={dir.id} directory={dir} />
                ))}
            </div>
          </SidebarContainer>
        </div>
      </aside>
    </>
  );
}
