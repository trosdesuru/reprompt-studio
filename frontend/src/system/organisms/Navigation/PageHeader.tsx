"use client";

import { useState, useEffect } from "react";
import { Breadcrumbs } from "@/src/system/organisms/Navigation/Breadcrumbs";

export function PageHeader({ title, subtitle, description, icon, breadcrumbItems }: any) {
  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      if (currentScrollY > lastScrollY && currentScrollY > 150) {
        setIsVisible(false);
      } else {
        setIsVisible(true);
      }
      setLastScrollY(currentScrollY);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [lastScrollY]);

  return (
    <header
      className={`
        hidden md:block 
        sticky top-0 z-40 w-full transition-all duration-500 ease-in-out
        ${isVisible ? "translate-y-0 opacity-100" : "-translate-y-full opacity-0"}
        bg-background/80 backdrop-blur-xl px-4 md:px-0 py-6
      `}
    >
      <div className="w-full mx-auto space-y-4">
        <Breadcrumbs items={breadcrumbItems} />
        <div className="flex justify-between items-center gap-4">
          <div>
            <h1 className="text-2xl text-foreground font-black tracking-tighter flex items-center gap-2">
              <span className="text-(--accent-color)">{icon}</span>
              {title} {subtitle && <span className="font-mono font-medium opacity-70">{subtitle}</span>}
            </h1>
            <p className="text-muted-foreground font-mono text-xs tracking-widest">
              {description}
            </p>
          </div>
        </div>
      </div>
    </header>
  );
}
