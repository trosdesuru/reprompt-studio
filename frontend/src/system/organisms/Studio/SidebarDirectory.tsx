"use client";
import React, { useState } from 'react';
import { Folder, FolderOpen, ChevronRight, ChevronDown, MoreVertical } from 'lucide-react';
import { useStudio, Directory } from '@/src/features/studio/hooks/useStudio';

interface SidebarDirectoryProps {
  directory: Directory;
  level?: number;
}

export const SidebarDirectory = ({ directory, level = 0 }: SidebarDirectoryProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const { activeDirectoryId, setActiveDirectory, getChildDirectories } = useStudio();
  
  const children = getChildDirectories(directory.id);
  const isSelected = activeDirectoryId === directory.id;

  const handleSelect = (e: React.MouseEvent) => {
    e.stopPropagation();
    setActiveDirectory(directory.id);
    if (children.length > 0) {
      setIsOpen(!isOpen);
    }
  };

  return (
    <div className="select-none">
      <div 
        onClick={handleSelect}
        className={`
          group flex items-center py-1.5 px-2 mx-2 rounded-md cursor-pointer transition-all duration-200
          ${isSelected ? 'bg-primary/10 text-primary' : 'hover:bg-secondary/50 text-muted-foreground hover:text-foreground'}
        `}
        style={{ paddingLeft: `${(level * 12) + 8}px` }}
      >
        <span className="w-4 h-4 mr-1 flex items-center justify-center">
          {children.length > 0 && (
            isOpen ? <ChevronDown size={14} /> : <ChevronRight size={14} />
          )}
        </span>
        
        <span className="mr-2">
          {isOpen ? (
            <FolderOpen size={16} className={isSelected ? 'text-primary' : 'text-blue-400'} />
          ) : (
            <Folder size={16} className={isSelected ? 'text-primary' : 'text-blue-400'} />
          )}
        </span>
        
        <span className="text-sm font-medium truncate flex-1">
          {directory.name}
        </span>

        {/* Botón de acciones (Aparece al hacer hover) */}
        <button className="opacity-0 group-hover:opacity-100 p-1 hover:bg-background/80 rounded transition-opacity">
          <MoreVertical size={14} />
        </button>
      </div>

      {isOpen && children.length > 0 && (
        <div className="mt-0.5">
          {children.map((child) => (
            <SidebarDirectory key={child.id} directory={child} level={level + 1} />
          ))}
        </div>
      )}
    </div>
  );
};