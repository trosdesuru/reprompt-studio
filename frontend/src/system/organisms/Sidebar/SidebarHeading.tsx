import React from "react";

export function SidebarHeading({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <p
      className={`text-[10px] font-black font-mono text-tertiary uppercase tracking-widest px-6 mb-2 ${className}`}
    >
      {children}
    </p>
  );
}
