"use client";

import React from "react";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export type NeoIconVariant = "danger" | "success" | "warning" | "info" | "primary";

interface NeoIconBadgeProps {
  children: React.ReactNode;
  variant?: NeoIconVariant;
  className?: string;
}

// Diccionario de estilos Neo-Brutalistas por variante
const variantStyles: Record<NeoIconVariant, string> = {
  danger: "bg-red-500/10 border-red-500 text-red-500 shadow-[4px_4px_0px_0px_rgba(239,68,68,1)]",
  success:
    "bg-green-500/10 border-green-500 text-green-500 shadow-[4px_4px_0px_0px_rgba(34,197,94,1)]",
  warning:
    "bg-orange-500/10 border-orange-500 text-orange-500 shadow-[4px_4px_0px_0px_rgba(249,115,22,1)]",
  info: "bg-blue-500/10 border-blue-500 text-blue-500 shadow-[4px_4px_0px_0px_rgba(59,130,246,1)]",
  primary:
    "bg-foreground/5 border-foreground text-foreground shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,1)]",
};

export function NeoIconBadge({ children, variant = "primary", className }: NeoIconBadgeProps) {
  return (
    <div
      className={cn(
        "w-16 h-16 border-2 rounded-full flex items-center justify-center shrink-0 transition-transform hover:-translate-y-1 hover:shadow-[6px_6px_0px_0px]",
        variantStyles[variant],
        className,
      )}
    >
      {children}
    </div>
  );
}
