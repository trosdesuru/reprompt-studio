"use client";

import { IconFolderPlus, IconCloudUpload, IconFolder } from "@tabler/icons-react";
import { useStudioUI, Directory } from "@/src/store/useStudioUI";
import { useFileUploader } from "@/src/features/extractor/hooks/useFileUploader";
import { useDirectoryActions } from "@/src/features/studio/hooks/useDirectoryActions";
import { useDroppable } from "@dnd-kit/core";

import {
  SidebarContainer,
  SidebarDivider,
  getSidebarItemClasses,
} from "@/src/system/organisms/Sidebar/SidebarCore";
import { SidebarDirectory } from "@/src/system/molecules/Studio/SidebarDirectory";

export function StudioSidebar() {
  const { directories, activeDirectoryId, setActiveDirectory } = useStudioUI();
  const { createDirectory } = useDirectoryActions();
  const { handleUploadClick } = useFileUploader();

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
    <SidebarContainer>
      <div className="px-3 mb-1 group relative">
        <div
          ref={setRootDropRef}
          onClick={() => setActiveDirectory(null)}
          role="button"
          className={getSidebarItemClasses(isRootActive, isRootOver)}
        >
          <IconFolder size={18} stroke={1.5} />
          <span className="tracking-widest flex-1 text-left text-xs">
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

      <SidebarDivider />

      <div className="px-3 flex flex-col gap-1">
        {directories
          .filter((d: Directory) => d.parent_id === null)
          .map((dir: Directory) => (
            <SidebarDirectory key={dir.id} directory={dir} />
          ))}
      </div>
    </SidebarContainer>
  );
}
