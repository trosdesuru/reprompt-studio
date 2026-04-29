"use client";

import { useState, useEffect } from "react";

export function useScrollDirection() {
  const [scrollDirection, setScrollDirection] = useState<"up" | "down">("up");

  useEffect(() => {
    let lastScrollY = 0;
    let ticking = false;

    const onScroll = (event: Event) => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          const target = event.target as HTMLElement | Document;

          let currentScrollY = 0;
          let clientHeight = 0;
          let scrollHeight = 0;

          if (
            target === document ||
            target === document.documentElement ||
            target === document.body
          ) {
            currentScrollY = window.scrollY;
            clientHeight = window.innerHeight;
            scrollHeight = document.documentElement.scrollHeight;
          } else {
            const el = target as HTMLElement;
            currentScrollY = el.scrollTop;
            clientHeight = el.clientHeight;
            scrollHeight = el.scrollHeight;
          }

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

    window.addEventListener("scroll", onScroll, true);

    return () => window.removeEventListener("scroll", onScroll, true);
  }, []);

  return scrollDirection;
}
