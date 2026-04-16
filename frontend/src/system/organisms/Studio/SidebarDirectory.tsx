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

interface SidebarDirectoryProps {
  directory: Directory;
  level?: number;
}

export const SidebarDirectory = ({ directory, level = 0 }: SidebarDirectoryProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const { activeDirectoryId, setActiveDirectory, getChildDirectories, deleteDirectory } =
    useStudioUI();

  const children = getChildDirectories(directory.id);
  const isSelected = activeDirectoryId === directory.id;

  // 🟢 LÓGICA DRAG & DROP
  const {
    attributes,
    listeners,
    setNodeRef: setDraggableRef,
    transform,
    isDragging,
  } = useDraggable({
    id: `dir-${directory.id}`,
    data: { type: "directory", directory },
  });

  const { setNodeRef: setDroppableRef, isOver } = useDroppable({
    id: directory.id,
    data: { type: "directory", directory },
  });

  // Combinar referencias para que sea arrastrable y zona de soltar
  const setBothRefs = (node: HTMLElement | null) => {
    setDraggableRef(node);
    setDroppableRef(node);
  };

  const style = transform
    ? {
        transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
        zIndex: 50,
        opacity: 0.8,
      }
    : undefined;

  const handleSelect = (e: React.MouseEvent) => {
    e.stopPropagation();
    setActiveDirectory(directory.id);
    if (children.length > 0) {
      setIsOpen(!isOpen);
    }
  };

  return (
    <div className="select-none relative">
      <div
        ref={setBothRefs}
        style={{ ...style, paddingLeft: `${level * 12 + 8}px` }}
        {...attributes}
        {...listeners}
        onClick={handleSelect}
        className={`
          group flex items-center py-1.5 px-2 mx-2 rounded-md cursor-pointer transition-all duration-200
          ${isSelected ? "bg-primary/10 text-primary" : "text-muted-foreground hover:text-foreground"}
          ${isOver ? "bg-primary/20 ring-1 ring-primary" : "hover:bg-secondary/50"}
          ${isDragging ? "shadow-lg bg-background border border-primary/50" : ""}
        `}
      >
        <span
          className="w-4 h-4 mr-1 flex items-center justify-center z-10"
          onClick={(e) => {
            e.stopPropagation();
            setIsOpen(!isOpen);
          }}
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

        <span className="text-sm font-medium truncate flex-1">{directory.name}</span>

        {/* Controles: Solo visibles al hacer hover */}
        <div className="opacity-0 group-hover:opacity-100 flex items-center gap-1 transition-opacity">
          <button
            className="p-1 hover:bg-background/80 rounded"
            onClick={(e) => {
              e.stopPropagation(); /* Aquí podrías abrir un input para crear subcarpeta */
            }}
          >
            <IconFolderPlus size={14} />
          </button>
          <button
            className="p-1 hover:bg-destructive/20 text-destructive rounded"
            onClick={(e) => {
              e.stopPropagation();
              deleteDirectory(directory.id);
            }}
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
