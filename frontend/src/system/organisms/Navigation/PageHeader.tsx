"use client";

import { useState, useEffect } from "react";
import { Breadcrumbs } from "@/src/system/molecules/Navigation/Breadcrumbs";

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  description: string;
  icon: React.ReactNode;
  breadcrumbItems: any[];
  scrollContainerId?: string;
  collapseOnHide?: boolean;
}

export function PageHeader({
  title,
  subtitle,
  description,
  icon,
  breadcrumbItems,
  scrollContainerId,
  collapseOnHide = false,
}: PageHeaderProps) {
  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);

  useEffect(() => {
    const target = scrollContainerId ? document.getElementById(scrollContainerId) : window;
    if (!target) return;

    const handleScroll = () => {
      const currentScrollY = scrollContainerId ? (target as HTMLElement).scrollTop : window.scrollY;

      if (currentScrollY > lastScrollY && currentScrollY > 100) {
        setIsVisible(false);
      } else if (currentScrollY < lastScrollY) {
        setIsVisible(true);
      }

      setLastScrollY(currentScrollY);
    };

    target.addEventListener("scroll", handleScroll, { passive: true });
    return () => target.removeEventListener("scroll", handleScroll);
  }, [lastScrollY, scrollContainerId]);

  const visibilityClasses = isVisible
    ? "opacity-100 translate-y-0 max-h-[300px] mb-4"
    : collapseOnHide
      ? "opacity-0 -translate-y-4 max-h-0 overflow-hidden mb-0"
      : "opacity-0 -translate-y-full";

  return (
    <div className={`transition-all duration-500 ease-in-out ${visibilityClasses}`}>
      <header
        className={`
          md:block w-full bg-background/80
          ${!collapseOnHide ? "sticky top-0 z-40" : "relative z-40"}
        `}
      >
        <div className="w-full mx-auto space-y-6">
          <div className="flex justify-between items-center gap-4">
            <div>
              <h1 className="text-2xl text-foreground/90 font-black tracking-tighter flex items-center gap-2">
                <span className="text-foreground/90">{icon}</span>
                {title}{" "}
                {subtitle && <span className="font-mono font-medium opacity-70">{subtitle}</span>}
              </h1>
              <p className="text-foreground/40 font-mono text-xs tracking-widest">
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
