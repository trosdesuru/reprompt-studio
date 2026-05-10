"use client";

import { useState } from "react";
import { IconFolderPlus, IconCloudUpload, IconFolder } from "@tabler/icons-react";
import { useDroppable } from "@dnd-kit/core";

import { useStudioUI, Directory } from "@/src/store/useStudioUI";
import { useDirectoryActions } from "@/src/features/studio/hooks/useDirectoryActions";
import { useFileUploader } from "@/src/features/extractor/hooks/useFileUploader";
import { useTranslation } from "@/src/dictionaries/I18nProvider";

import { getSidebarItemClasses } from "@/src/system/organisms/Sidebar";
import { SidebarDirectory } from "@/src/system/molecules/Studio/SidebarDirectory";
import { SidebarHeading } from "@/src/system/organisms/Sidebar/SidebarHeading";
import { Button } from "@/src/system/atoms/Button/Button";

export function SidebarWorkspaceSection() {
  const { t } = useTranslation();
  const { directories, activeDirectoryId, setActiveDirectory, setSidebarOpen } = useStudioUI();
  const { createDirectory } = useDirectoryActions();
  const { handleUploadClick } = useFileUploader();

  const [isCreatingRoot, setIsCreatingRoot] = useState(false);
  const [newFolderName, setNewFolderName] = useState("");

  const { setNodeRef: setRootDropRef, isOver: isRootOver } = useDroppable({
    id: "root-zone",
    data: { type: "root" },
  });

  const handleCreateRootFolderClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsCreatingRoot(true);
  };

  const submitNewFolder = async () => {
    if (newFolderName.trim()) {
      await createDirectory(newFolderName.trim(), null);
    }
    setIsCreatingRoot(false);
    setNewFolderName("");
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") submitNewFolder();
    if (e.key === "Escape") {
      setIsCreatingRoot(false);
      setNewFolderName("");
    }
  };

  const isRootActive = activeDirectoryId === null;

  return (
    <>
      <div className="px-3 pt-4 pb-2">
        <SidebarHeading>{t("studio.sidebar_section_workspace") || "Mi Espacio"}</SidebarHeading>
      </div>

      <div className="px-3 mb-1 group relative">
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
            <span className="font-mono font-medium lowercase text-foreground/70">reprompt</span>{" "}
            root
          </span>

          <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleCreateRootFolderClick}
              className="p-1 h-auto text-muted-foreground hover:text-foreground"
              title={t("studio.new_folder") || "Nueva carpeta"}
            >
              <IconFolderPlus size={16} stroke={2} />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleUploadClick}
              className="p-1 h-auto text-muted-foreground hover:text-foreground"
              title={t("studio.upload_root") || "Subir a Root"}
            >
              <IconCloudUpload size={16} stroke={2} />
            </Button>
          </div>
        </div>
      </div>

      {isCreatingRoot && (
        <div className="px-3 mb-2 animate-in fade-in slide-in-from-top-1 duration-200">
          <div className="flex items-center gap-2 px-3 py-1.5 bg-background border border-accent rounded-md shadow-sm">
            <IconFolderPlus size={14} className="text-accent shrink-0" />
            <input
              autoFocus
              type="text"
              value={newFolderName}
              onChange={(e) => setNewFolderName(e.target.value)}
              onKeyDown={handleKeyDown}
              onBlur={submitNewFolder}
              placeholder={t("common.name") || "Nombre..."}
              className="flex-1 bg-transparent outline-none text-xs font-mono text-foreground placeholder:text-muted-foreground w-full"
            />
          </div>
        </div>
      )}

      <div className="px-3 flex flex-col gap-1 overflow-y-auto">
        {directories
          .filter((d: Directory) => d.parent_id === null)
          .map((dir: Directory) => (
            <SidebarDirectory key={dir.id} directory={dir} />
          ))}
      </div>
    </>
  );
}
