"use client";

import { useState } from "react";
import { useStudioUI, Directory } from "@/src/store/useStudioUI";
import { SidebarDirectoryItem } from "../../atoms/Studio/SidebarDirectoryItem";
import { useDirectoryDnd } from "@/src/features/studio/hooks/useDirectoryDnd";
import { useDirectoryActions } from "@/src/features/studio/hooks/useDirectoryActions";

interface Props {
  directory: Directory;
  level?: number;
}

export function SidebarDirectory({ directory, level = 0 }: Props) {
  const [isOpen, setIsOpen] = useState(false);
  const { getChildDirectories, activeDirectoryId, setActiveDirectory } = useStudioUI();

  const { createDirectory, deleteDirectory, renameDirectory } = useDirectoryActions();

  const { setBothRefs, isDragging, isOver, attributes, listeners } = useDirectoryDnd(directory);

  const children = getChildDirectories(directory.id);
  const hasChildren = children.length > 0;
  const isSelected = activeDirectoryId === directory.id;

  const handleCreateSubdirectory = async (onSuccess: () => void) => {
    const name = window.prompt("Nombre de la sub-carpeta:");
    if (name?.trim()) {
      await createDirectory(name.trim(), directory.id);
      onSuccess();
    }
  };

  if (isDragging) return null;

  return (
    <div className="flex flex-col w-full" ref={setBothRefs}>
      <SidebarDirectoryItem
        directory={directory}
        level={level}
        isOpen={isOpen}
        hasChildren={hasChildren}
        isSelected={isSelected}
        isOver={isOver}
        isDragging={isDragging}
        setBothRefs={setBothRefs}
        attributes={attributes}
        listeners={listeners}
        isEffectivelyPrivate={directory.is_private || false}
        onToggle={() => setIsOpen(!isOpen)}
        onSelect={() => setActiveDirectory(directory.id)}
        onCreateSub={(e) => {
          e.stopPropagation();
          handleCreateSubdirectory(() => setIsOpen(true));
        }}
        onDelete={(e) => {
          e.stopPropagation();
          if (window.confirm(`¿Borrar "${directory.name}"?`)) {
            deleteDirectory(directory.id);
          }
        }}
        onRename={(e) => {
          e.stopPropagation();
          const newName = window.prompt("Nuevo nombre:", directory.name);
          if (newName && newName.trim() !== directory.name) {
            renameDirectory(directory.id, newName.trim());
          }
        }}
      />

      {isOpen && hasChildren && (
        <div className="flex flex-col w-full">
          {children.map((child: Directory) => (
            <SidebarDirectory key={child.id} directory={child} level={level + 1} />
          ))}
        </div>
      )}
    </div>
  );
}
