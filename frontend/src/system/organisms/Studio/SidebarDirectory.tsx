"use client";

import React, { useState } from "react";
import { useStudioUI, Directory } from "@/src/store/useStudioUI";
import { useDirectoryActions } from "@/src/features/studio/hooks/useDirectoryActions";
import { useDirectoryDnd } from "@/src/features/studio/hooks/useDirectoryDnd";
import { SidebarDirectoryItem } from "../../molecules/Studio/SidebarDirectoryItem";

interface SidebarDirectoryProps {
  directory: Directory;
  level?: number;
  inheritedPrivacy?: boolean;
}

export const SidebarDirectory = ({
  directory,
  level = 0,
  inheritedPrivacy = false,
}: SidebarDirectoryProps) => {
  const [isOpen, setIsOpen] = useState(false);

  // 1. Estado Global
  const { activeDirectoryId, getChildDirectories } = useStudioUI();
  const children = getChildDirectories(directory.id);
  const isSelected = activeDirectoryId === directory.id;
  const isEffectivelyPrivate = directory.is_private || inheritedPrivacy;

  // 2. Hooks de Lógica
  const {
    setActiveDirectory,
    handleCreateSubdirectory,
    handleDeleteDirectory,
    handleRenameDirectory,
  } = useDirectoryActions(directory.id, directory.name);

  const { attributes, listeners, setBothRefs, isDragging, isOver } = useDirectoryDnd(directory);

  // 3. Manejadores de Eventos
  const handleSelect = (e: React.MouseEvent) => {
    e.stopPropagation();
    setActiveDirectory(directory.id);
    if (children.length > 0 && !isOpen) setIsOpen(true);
  };

  return (
    <div className="select-none relative">
      <SidebarDirectoryItem
        directory={directory}
        level={level}
        isOpen={isOpen}
        isSelected={isSelected}
        isDragging={isDragging}
        isOver={isOver}
        isEffectivelyPrivate={isEffectivelyPrivate}
        hasChildren={children.length > 0}
        setBothRefs={setBothRefs}
        attributes={attributes}
        listeners={listeners}
        onSelect={handleSelect}
        onToggle={(e) => {
          e.stopPropagation();
          setIsOpen(!isOpen);
        }}
        onRename={(e) => {
          e.stopPropagation();
          handleRenameDirectory();
        }}
        onCreateSub={(e) => {
          e.stopPropagation();
          handleCreateSubdirectory(() => setIsOpen(true));
        }}
        onDelete={(e) => {
          e.stopPropagation();
          handleDeleteDirectory(isSelected);
        }}
      />

      {isOpen && children.length > 0 && (
        <div className="mt-0.5">
          {children.map((child: Directory) => (
            <SidebarDirectory
              key={child.id}
              directory={child}
              level={level + 1}
              inheritedPrivacy={isEffectivelyPrivate}
            />
          ))}
        </div>
      )}
    </div>
  );
};
