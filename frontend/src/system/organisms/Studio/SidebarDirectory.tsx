"use client";

import React, { useState } from "react";
import { useStudioUI, Directory } from "@/src/store/useStudioUI";
import { useDraggable, useDroppable } from "@dnd-kit/core";
import {
  IconChevronDown,
  IconChevronRight,
  IconFolderOpen,
  IconFolder,
  IconFolderPlus,
  IconTrash,
} from "@tabler/icons-react";
import toast from "react-hot-toast";

interface SidebarDirectoryProps {
  directory: Directory;
  level?: number;
}

export const SidebarDirectory = ({ directory, level = 0 }: SidebarDirectoryProps) => {
  const [isOpen, setIsOpen] = useState(false);

  const {
    activeDirectoryId,
    setActiveDirectory,
    getChildDirectories,
    deleteDirectory,
    createDirectory,
    renameDirectory,
  } = useStudioUI();

  const children = getChildDirectories(directory.id);
  const isSelected = activeDirectoryId === directory.id;

  const {
    attributes,
    listeners,
    setNodeRef: setDraggableRef,
    isDragging,
  } = useDraggable({
    id: `dir-${directory.id}`,
    data: { type: "directory", directory },
  });

  const { setNodeRef: setDroppableRef, isOver } = useDroppable({
    id: directory.id,
    data: { type: "directory", directory },
  });

  const setBothRefs = (node: HTMLElement | null) => {
    setDraggableRef(node);
    setDroppableRef(node);
  };

  const style = {
    opacity: isDragging ? 0.4 : 1,
    cursor: isDragging ? "grabbing" : "pointer",
    paddingLeft: `${level * 12 + 12}px`,
  };

  const handleSelect = (e: React.MouseEvent) => {
    e.stopPropagation();
    setActiveDirectory(directory.id);
    if (children.length > 0 && !isOpen) {
      setIsOpen(true);
    }
  };

  const handleToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsOpen(!isOpen);
  };

  const handleCreateSubdirectory = async (e: React.MouseEvent) => {
    e.stopPropagation();
    const name = window.prompt("Nombre de la nueva subcarpeta:");
    if (!name || name.trim() === "") return;
    try {
      await createDirectory(name.trim(), directory.id);
      toast.success("Subcarpeta creada");
      setIsOpen(true);
    } catch (error: any) {
      toast.error("Error al crear subcarpeta");
    }
  };

  const handleDeleteDirectory = async (e: React.MouseEvent) => {
    e.stopPropagation();
    const confirm = window.confirm(`¿Eliminar "${directory.name}"?`);
    if (!confirm) return;
    try {
      await deleteDirectory(directory.id);
      toast.success("Carpeta eliminada");
      if (isSelected) setActiveDirectory(null);
    } catch (error: any) {
      toast.error("Error al eliminar");
    }
  };

  const handleDoubleClick = async (e: React.MouseEvent) => {
    e.stopPropagation();
    const newName = window.prompt("Renombrar carpeta:", directory.name);
    if (!newName || newName.trim() === "" || newName.trim() === directory.name) return;
    try {
      await renameDirectory(directory.id, newName.trim());
      toast.success("Renombrada");
    } catch (error: any) {
      toast.error("Error al renombrar");
    }
  };

  return (
    <div className="select-none relative">
      <div
        ref={setBothRefs}
        style={style}
        {...attributes}
        {...listeners}
        onClick={handleSelect}
        onDoubleClick={handleDoubleClick}
        className={`
          group font-mono flex items-center py-1.5 px-2 mx-2 rounded-md transition-all duration-200 relative
          ${isSelected ? "bg-primary/5 text-foreground font-medium" : "text-muted-foreground hover:text-foreground"}
          ${isOver ? "bg-primary/10 ring-2 ring-primary/30 border-dashed" : "hover:bg-secondary/40 border border-transparent"}
          ${isDragging ? "bg-background border-dashed border-primary/50" : ""}
        `}
      >
        {isSelected && (
          <div
            className="absolute left-0 w-1 h-6 bg-primary rounded-r-full shadow-[0_0_8px_rgba(var(--primary-rgb),0.4)]"
            style={{ top: "50%", transform: "translateY(-50%)" }}
          />
        )}

        <span
          className="w-4 h-4 mr-1 flex items-center justify-center z-10 hover:bg-muted/50 rounded transition-colors"
          onClick={handleToggle}
        >
          {children.length > 0 &&
            (isOpen ? <IconChevronDown size={14} /> : <IconChevronRight size={14} />)}
        </span>

        <span className="mr-2">
          {isOpen ? (
            <IconFolderOpen
              size={16}
              className={isSelected ? "text-primary/70" : "text-foreground/40"}
            />
          ) : (
            <IconFolder
              size={16}
              className={isSelected ? "text-primary/70" : "text-foreground/40"}
            />
          )}
        </span>

        <span className="text-sm truncate flex-1">{directory.name}</span>

        <div className="opacity-0 group-hover:opacity-100 flex items-center gap-1 transition-opacity pointer-events-auto">
          <button
            className="p-1 hover:bg-primary/20 rounded transition-colors text-primary/70"
            title="Nueva Subcarpeta"
            onClick={handleCreateSubdirectory}
          >
            <IconFolderPlus size={14} />
          </button>
          <button
            className="p-1 hover:bg-destructive/20 hover:text-destructive/90 text-muted-foreground/40 rounded transition-colors"
            title="Eliminar"
            onClick={handleDeleteDirectory}
          >
            <IconTrash size={14} />
          </button>
        </div>
      </div>

      {isOpen && children.length > 0 && (
        <div className="mt-0.5">
          {children.map((child: Directory) => (
            <SidebarDirectory key={child.id} directory={child} level={level + 1} />
          ))}
        </div>
      )}
    </div>
  );
};
