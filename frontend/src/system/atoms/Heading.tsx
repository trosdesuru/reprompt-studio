import React from "react";
import { cn } from "@/src/utils/lib/cn";

type HeadingLevel = "h1" | "h2" | "h3" | "h4" | "h5" | "h6";

interface HeadingProps extends React.HTMLAttributes<HTMLHeadingElement> {
  level?: HeadingLevel;
  children: React.ReactNode;
  className?: string;
}

export function Heading({ level = "h2", children, className, ...props }: HeadingProps) {
  const Component = level;

  // Estilos base: Limpios, legibles, sin decoraciones
  const baseStyles = "font-sans text-foreground tracking-tight";

  // Jerarquía tipográfica minimalista
  const sizeStyles = {
    h1: "text-4xl md:text-5xl font-extrabold tracking-tighter",
    h2: "text-3xl md:text-4xl font-bold",
    h3: "text-2xl md:text-3xl font-semibold",
    h4: "text-xl md:text-2xl font-semibold",
    h5: "text-lg md:text-xl font-medium",
    h6: "text-base md:text-lg font-medium",
  };

  return (
    <Component className={cn(baseStyles, sizeStyles[level], className)} {...props}>
      {children}
    </Component>
  );
}
