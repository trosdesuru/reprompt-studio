import React from "react";

export function SidebarActionGroup({ children }: { children: React.ReactNode }) {
  return (
    <div className="opacity-0 group-hover:opacity-100 flex items-center gap-1 transition-opacity pointer-events-auto">
      {children}
    </div>
  );
}
