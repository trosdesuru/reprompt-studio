"use client";

import Link from "next/link";
import { useScrollDirection } from "@/src/utils/hooks/useScrollDirection";

export function Footer() {
  const scrollDirection = useScrollDirection();

  return (
    <footer
      className={`fixed bottom-0 left-0 right-0 z-40 bg-background border-t-2 border-border/50 backdrop-blur-md transition-transform duration-300 ease-in-out ${
        scrollDirection === "down" ? "translate-y-full" : "translate-y-0"
      }`}
    >
      <div className="max-w-400 mx-auto px-4 md:px-8 py-3 flex items-center justify-center gap-4">
        <div className="flex items-center gap-4 md:gap-6 text-xs font-mono font-semibold text-muted-foreground uppercase tracking-widest">
          <span className="opacity-50">© {new Date().getFullYear()} Reprompt</span>

          <div className="hidden md:flex items-center gap-4">
            <Link href="#" className="hover:text-foreground transition-colors">
              Términos
            </Link>

            <Link href="#" className="hover:text-foreground transition-colors">
              Privacidad
            </Link>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <Link
            href="#"
            className="md:hidden text-xs font-mono font-semibold text-muted-foreground uppercase tracking-widest hover:text-foreground transition-colors"
          >
            Legal
          </Link>

          <span className="px-2.5 py-1 bg-accent text-white text-xs font-black uppercase tracking-widest rounded-md shadow-[2px_2px_0px_0px_rgba(0,0,0,0.2)] dark:shadow-[2px_2px_0px_0px_rgba(255,255,255,0.1)] cursor-default select-none">
            BETA v1.0
          </span>
        </div>
      </div>
    </footer>
  );
}
