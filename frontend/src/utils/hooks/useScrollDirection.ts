"use client";

import { useState, useEffect } from "react";

export function useScrollDirection(enabled: boolean = true) {
  const [scrollDirection, setScrollDirection] = useState<"up" | "down">("up");

  useEffect(() => {
    if (!enabled) {
      setScrollDirection("up");
      return;
    }

    let lastScrollY = 0;
    let ticking = false;

    const onScroll = (event: Event) => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          const target = event.target as HTMLElement | Document;

          if (
            target !== document &&
            target !== document.documentElement &&
            target !== document.body
          ) {
            ticking = false;
            return;
          }

          const currentScrollY = window.scrollY;
          const clientHeight = window.innerHeight;
          const scrollHeight = document.documentElement.scrollHeight;

          if (Math.abs(currentScrollY - lastScrollY) < 10) {
            ticking = false;
            return;
          }

          const isBouncingAtBottom = currentScrollY + clientHeight >= scrollHeight - 5;

          if (currentScrollY > lastScrollY) {
            setScrollDirection("down");
          } else if (currentScrollY < lastScrollY) {
            if (!isBouncingAtBottom) {
              setScrollDirection("up");
            }
          }

          lastScrollY = currentScrollY > 0 ? currentScrollY : 0;
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener("scroll", onScroll, false);

    return () => window.removeEventListener("scroll", onScroll, false);
  }, [enabled]);

  return scrollDirection;
}
