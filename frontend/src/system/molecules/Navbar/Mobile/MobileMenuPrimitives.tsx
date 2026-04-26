import Link from "next/link";
import { IconX } from "@tabler/icons-react";
import React from "react";

export const MenuHeader = ({ onClose }: { onClose: () => void }) => (
  <div className="flex items-center justify-between p-4 border-b border-border bg-background shrink-0">
    <span className="font-black text-lg tracking-tighter">REPROMPT</span>
    <button
      onClick={onClose}
      className="p-2 bg-muted/50 rounded-full text-foreground hover:bg-muted transition-colors"
      aria-label="Cerrar menú"
    >
      <IconX size={24} />
    </button>
  </div>
);

export interface MenuLinkProps {
  href: string;
  icon: React.ElementType;
  label: string;
  onClick: () => void;
  className?: string;
}

export const MenuLink = ({ href, icon: Icon, label, onClick, className = "" }: MenuLinkProps) => (
  <Link
    href={href}
    onClick={onClick}
    className={`flex items-center gap-3 p-3 rounded-md hover:bg-muted font-medium text-sm transition-colors ${className}`}
  >
    <Icon size={18} className="shrink-0" /> {label}
  </Link>
);

export const MenuSection = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <div className="flex flex-col gap-1">
    <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2 px-2">
      {title}
    </span>
    {children}
  </div>
);
