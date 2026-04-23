export function getSidebarItemClasses(isActive: boolean, isOverDropzone: boolean = false) {
  const baseClasses =
    "w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-all border cursor-pointer";

  const stateClasses = isActive
    ? "bg-primary/10 text-primary border-primary/20 font-bold"
    : "text-muted-foreground hover:bg-secondary/40 border-transparent font-medium";

  const dropzoneClasses = isOverDropzone ? "ring-2 ring-primary border-dashed bg-primary/20" : "";

  return `${baseClasses} ${stateClasses} ${dropzoneClasses}`.trim();
}

export function getSidebarTreeItemClasses(isActive: boolean, isOver: boolean, isDragging: boolean) {
  const baseClasses =
    "group font-mono flex items-center py-1.5 px-2 mx-2 rounded-md transition-all duration-200 relative";

  let stateClasses = isActive
    ? "bg-primary/5 text-foreground font-medium"
    : "text-muted-foreground hover:text-foreground hover:bg-secondary/40 border border-transparent";

  if (isOver) {
    stateClasses = "bg-primary/10 ring-2 ring-primary/30 border-dashed";
  }

  if (isDragging) {
    stateClasses = "bg-background border-dashed border-primary/50";
  }

  return `${baseClasses} ${stateClasses}`.trim();
}
