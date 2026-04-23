import React from "react";

export function SidebarContainer({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <aside
      className={`w-72 border-r border-border/30 bg-muted/5 flex-col hidden md:flex h-full shrink-0 ${className}`}
    >
      <div className="pt-6 flex-1 overflow-y-auto custom-scrollbar flex flex-col gap-1">
        {children}
      </div>
    </aside>
  );
}
