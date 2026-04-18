"use client";

import { IconFolderPlus, IconCloudUpload, IconFolder } from "@tabler/icons-react";
import { useStudioUI, Directory } from "@/src/store/useStudioUI";
import { SidebarDirectory } from "@/src/system/organisms/Studio/SidebarDirectory";
import { useFileUploader } from "@/src/features/studio/hooks/useFileUploader";

export function StudioSidebar() {
  const { directories, createDirectory, activeDirectoryId, setActiveDirectory } = useStudioUI();
  const { handleUploadClick } = useFileUploader();

  const handleCreateRootFolder = async () => {
    const name = window.prompt("Nombre de la nueva carpeta:");
    if (name?.trim()) await createDirectory(name.trim(), null);
  };

  return (
    <aside className="w-72 border-r border-border/30 bg-muted/5 flex-col hidden md:flex">
      <div className="p-4 border-b border-border/30 flex items-center justify-between bg-card/10">
        <h2 className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/40">
          Studio Library
        </h2>
        <div className="flex gap-1">
          <button onClick={handleCreateRootFolder} className="p-1.5 hover:bg-secondary rounded-md text-muted-foreground/60 transition-colors">
            <IconFolderPlus size={16} stroke={1.5} />
          </button>
          <button onClick={handleUploadClick} className="p-1.5 hover:bg-secondary rounded-md text-primary/50 transition-colors">
            <IconCloudUpload size={16} stroke={1.5} />
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto py-4 custom-scrollbar flex flex-col gap-1">
        {/* 🏠 DIRECTORIO RAÍZ (Nivel 0) */}
        <div className="px-3 mb-1">
          <button
            onClick={() => setActiveDirectory(null)}
            className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-xs transition-all border ${
              activeDirectoryId === null
                ? "bg-primary/10 text-primary border-primary/20 font-bold"
                : "text-muted-foreground hover:bg-secondary/40 border-transparent font-medium"
            }`}
          >
            <IconFolder size={18} stroke={1.5} />
            <span className="uppercase tracking-widest">Directorio Raíz</span>
          </button>
        </div>

        <div className="mx-6 border-t border-border/10 my-1" />

        <div className="px-3 flex flex-col gap-1">
          {directories
            .filter((d: Directory) => d.parent_id === null)
            .map((dir: Directory) => (
              <SidebarDirectory key={dir.id} directory={dir} />
            ))}
        </div>
      </div>
    </aside>
  );
}