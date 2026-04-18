"use client";

import { ReactNode } from "react";
import { Breadcrumbs } from "@/src/system/organisms/Navigation/Breadcrumbs";

interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  description: string;
  icon: ReactNode;
  breadcrumbItems: BreadcrumbItem[];
}

export function PageHeader({
  title,
  subtitle,
  description,
  icon,
  breadcrumbItems,
}: PageHeaderProps) {
  return (
    <div className="space-y-8">
      {/* 1. Navegación */}
      <div>
        <Breadcrumbs items={breadcrumbItems} />
      </div>

      {/* 2. Título y Branding */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-border pb-8 mt-4">
        <div>
          <h1 className="text-3xl text-foreground font-bold tracking-tighter flex items-center gap-1">
            <div className="p-2 text-foreground rounded-lg">
              {icon}
            </div>
            {title}
            {subtitle && (
              <span className="font-mono font-medium lowercase text-foreground ml-1">
                {subtitle}
              </span>
            )}
          </h1>
          <p className="text-muted-foreground mt-1 font-mono text-sm">{description}</p>
        </div>
      </div>
    </div>
  );
}
