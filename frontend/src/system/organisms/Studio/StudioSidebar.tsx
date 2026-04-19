"use client";

import { IconFolderPlus, IconCloudUpload, IconFolder } from "@tabler/icons-react";
import { useStudioUI, Directory } from "@/src/store/useStudioUI";
import { SidebarDirectory } from "@/src/system/organisms/Studio/SidebarDirectory";
import { useFileUploader } from "@/src/features/studio/hooks/useFileUploader";

export function StudioSidebar() {
  const { directories, createDirectory, activeDirectoryId, setActiveDirectory } = useStudioUI();
  const { handleUploadClick } = useFileUploader();

  const handleCreateRootFolder = async (e: React.MouseEvent) => {
    e.stopPropagation();
    const name = window.prompt("Nombre de la nueva carpeta principal:");
    if (name?.trim()) await createDirectory(name.trim(), null);
  };

  return (
    <aside className="w-72 border-r border-border/30 bg-muted/5 flex-col hidden md:flex">
      <div className="pt-6 flex-1 overflow-y-auto custom-scrollbar flex flex-col gap-1">
        <div className="px-3 mb-1 group relative">
          <div
            onClick={() => setActiveDirectory(null)}
            className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-xs transition-all border cursor-pointer role="button" ${
              activeDirectoryId === null
                ? "bg-primary/10 text-primary border-primary/20 font-bold"
                : "text-muted-foreground hover:bg-secondary/40 border-transparent font-medium"
            }`}
          >
            <IconFolder size={18} stroke={1.5} />
            <span className="tracking-widest flex-1 text-left">
              <span className="font-mono font-medium lowercase text-foreground/70">reprompt</span>{" "}
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

        <div className="mx-6 border-t border-border/10 my-2" />

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
