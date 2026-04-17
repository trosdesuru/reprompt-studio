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
    paddingLeft: `${level * 12 + 8}px`,
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
      toast.success("Subcarpeta creada con éxito");
      setIsOpen(true); 
    } catch (error: any) {
      toast.error(error.message || "Error al crear la subcarpeta");
    }
  };

  const handleDeleteDirectory = async (e: React.MouseEvent) => {
    e.stopPropagation();
    const confirm = window.confirm(
      `¿Estás seguro de eliminar "${directory.name}"? Asegúrate de que esté vacía.`
    );
    if (!confirm) return;

    try {
      await deleteDirectory(directory.id);
      toast.success("Carpeta eliminada");
      if (isSelected) setActiveDirectory(null);
    } catch (error: any) {
      toast.error(error.message || "No se pudo eliminar la carpeta. ¿Está vacía?");
    }
  };

  // 🎯 NUEVO: Lógica de Doble Clic para Renombrar
  const handleDoubleClick = async (e: React.MouseEvent) => {
    e.stopPropagation(); // Evitamos que el doble clic burbujee al padre
    
    // Abrimos el prompt con el nombre actual ya escrito
    const newName = window.prompt("Renombrar carpeta:", directory.name);
    
    // Si cancela, lo deja vacío, o pone exactamente el mismo nombre, no hacemos nada
    if (!newName || newName.trim() === "" || newName.trim() === directory.name) return;

    try {
      await renameDirectory(directory.id, newName.trim());
      toast.success("Carpeta renombrada");
    } catch (error: any) {
      toast.error("Error al renombrar la carpeta");
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
        onDoubleClick={handleDoubleClick} // 🟢 Añadimos el evento de doble clic aquí
        className={`
          group flex items-center py-1.5 px-2 mx-2 rounded-md transition-all duration-200
          ${isSelected ? "bg-primary/10 text-primary font-bold" : "text-muted-foreground hover:text-foreground"}
          ${isOver ? "bg-primary/10 ring-2 ring-primary border-dashed neo-border" : "hover:bg-secondary/50 border border-transparent"}
          ${isDragging ? "bg-background border-dashed border-primary/50" : ""}
        `}
      >
        <span
          className="w-4 h-4 mr-1 flex items-center justify-center z-10 hover:bg-muted/50 rounded"
          onClick={handleToggle}
        >
          {children.length > 0 &&
            (isOpen ? <IconChevronDown size={14} /> : <IconChevronRight size={14} />)}
        </span>

        <span className="mr-2">
          {isOpen ? (
            <IconFolderOpen size={16} className={isSelected ? "text-primary" : "text-blue-400"} />
          ) : (
            <IconFolder size={16} className={isSelected ? "text-primary" : "text-blue-400"} />
          )}
        </span>

        <span className="text-sm truncate flex-1">{directory.name}</span>

        <div className="opacity-0 group-hover:opacity-100 flex items-center gap-1 transition-opacity">
          <button
            className="p-1 hover:bg-background/80 rounded transition-colors"
            title="Nueva Subcarpeta"
            onClick={handleCreateSubdirectory}
          >
            <IconFolderPlus size={14} />
          </button>
          <button
            className="p-1 hover:bg-destructive/20 text-destructive rounded transition-colors"
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