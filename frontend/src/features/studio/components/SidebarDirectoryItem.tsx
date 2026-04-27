import React from "react";
import { Directory } from "@/src/store/useStudioUI";
import { usePromptUpload } from "../hooks/usePromptUpload";
import {
  IconChevronDown,
  IconChevronRight,
  IconFolderOpen,
  IconFolder,
  IconFolderPlus,
  IconTrash,
  IconCloudLock,
} from "@tabler/icons-react";
import {
  getSidebarTreeItemClasses,
  SidebarActiveIndicator,
  SidebarActionGroup,
} from "@/src/system/organisms/Sidebar";

interface SidebarDirectoryItemProps {
  directory: Directory;
  level: number;
  isOpen: boolean;
  isSelected: boolean;
  isDragging: boolean;
  isOver: boolean;
  isEffectivelyPrivate: boolean;
  hasChildren: boolean;
  setBothRefs: (node: HTMLElement | null) => void;
  attributes: any;
  listeners: any;
  onSavePromptToDB?: (imageUrl: string, directoryId: string) => Promise<void>;
  onSelect: (e: React.MouseEvent) => void;
  onToggle: (e: React.MouseEvent) => void;
  onRename: (e: React.MouseEvent) => void;
  onCreateSub: (e: React.MouseEvent) => void;
  onDelete: (e: React.MouseEvent) => void;
}

export const SidebarDirectoryItem = ({
  directory,
  level,
  isOpen,
  isSelected,
  isDragging,
  isOver,
  isEffectivelyPrivate,
  hasChildren,
  setBothRefs,
  attributes,
  listeners,
  onSelect,
  onToggle,
  onRename,
  onCreateSub,
  onDelete,
}: SidebarDirectoryItemProps) => {
  return (
    <div
      ref={setBothRefs}
      style={{
        opacity: isDragging ? 0.4 : 1,
        cursor: isDragging ? "grabbing" : "pointer",
        paddingLeft: `${level * 12 + 12}px`,
      }}
      {...attributes}
      {...listeners}
      onClick={onSelect}
      onDoubleClick={onRename}
      className={getSidebarTreeItemClasses(isSelected, isOver, isDragging)}
    >
      {isSelected && <SidebarActiveIndicator />}

      <span
        className="w-4 h-4 mr-1 flex items-center justify-center z-10 hover:bg-muted/50 rounded transition-colors"
        onClick={onToggle}
      >
        {hasChildren && (isOpen ? <IconChevronDown size={14} /> : <IconChevronRight size={14} />)}
      </span>

      <span className="mr-2 relative flex items-center justify-center">
        {isOpen ? (
          <IconFolderOpen
            size={16}
            className={isSelected ? "text-primary/70" : "text-foreground/40"}
          />
        ) : (
          <IconFolder size={16} className={isSelected ? "text-primary/70" : "text-foreground/40"} />
        )}

        {isEffectivelyPrivate && (
          <div className="absolute -bottom-1 -right-1.5 bg-background rounded-full p-px">
            <IconCloudLock size={12} className="text-red-300" stroke={2} />
          </div>
        )}
      </span>

      <span className="text-sm truncate flex-1">{directory.name}</span>

      <SidebarActionGroup>
        <button
          className="p-1 hover:bg-primary/20 rounded transition-colors text-primary/70"
          title="Nueva Subcarpeta"
          onClick={onCreateSub}
        >
          <IconFolderPlus size={14} />
        </button>
        <button
          className="p-1 hover:bg-destructive/20 hover:text-destructive/90 text-muted-foreground/40 rounded transition-colors"
          title="Eliminar"
          onClick={onDelete}
        >
          <IconTrash size={14} />
        </button>
      </SidebarActionGroup>
    </div>
  );
};
