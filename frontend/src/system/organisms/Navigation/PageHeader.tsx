"use client";

import { Breadcrumbs } from "@/src/system/molecules/Navigation/Breadcrumbs";
import { useScrollDirection } from "@/src/utils/hooks/useScrollDirection";

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  description: string;
  icon: React.ReactNode;
  breadcrumbItems: any[];
  collapseOnHide?: boolean;
}

export function PageHeader({
  title,
  subtitle,
  description,
  icon,
  breadcrumbItems,
}: PageHeaderProps) {
  const scrollDirection = useScrollDirection();
  const isScrollingDown = scrollDirection === "down";

  return (
    <div
      className={`transition-all duration-800 ease-in-out ${
        isScrollingDown
          ? "opacity-0 -translate-y-2 max-h-0 overflow-hidden mb-0"
          : "opacity-100 translate-y-0 max-h-155 mb-4"
      }`}
    >
      <header className="md:block w-full bg-background/80">
        <div className="w-full mx-auto space-y-6">
          <div className="flex justify-between items-center gap-4">
            <div>
              <h1 className="text-xl sm:text-2xl text-foreground/90 font-sans font-black tracking-tighter flex items-center gap-2">
                <span className="text-foreground/60">{icon}</span>
                {title}{" "}
                {subtitle && (
                  <span className="font-mono font-medium text-foreground/60">{subtitle}</span>
                )}
              </h1>
              <p className="text-foreground/50 font-mono text-xs pt-1 tracking-widest">
                {description}
              </p>
            </div>
          </div>
          <Breadcrumbs items={breadcrumbItems} />
        </div>
      </header>
    </div>
  );
}
