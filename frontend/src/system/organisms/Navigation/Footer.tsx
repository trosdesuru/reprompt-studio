"use client";

import Link from "next/link";
import { usePathname, useParams } from "next/navigation";
import { useScrollDirection } from "@/src/utils/hooks/useScrollDirection";
import { useTranslation } from "@/src/dictionaries/I18nProvider";
import { LanguageSwitcher } from "@/src/system/molecules/Navigation/LanguageSwitcher";

export function Footer() {
  const { t } = useTranslation();
  const params = useParams();
  const lang = (params?.lang as string) || "es";

  const pathname = usePathname();

  // Asumiendo que actualizaste el hook para recibir el interruptor 'enabled'.
  // Si no, puedes dejar `const scrollDirection = useScrollDirection();`
  const isDetailView = pathname?.includes("/p/");
  const scrollDirection = useScrollDirection();

  const transformClass = isDetailView
    ? "translate-y-0"
    : scrollDirection === "down"
      ? "translate-y-full"
      : "translate-y-0";

  return (
    <footer
      className={`fixed bottom-0 left-0 right-0 z-40 bg-background/60 border-t-2 border-border/50 backdrop-blur-md transition-transform duration-300 ease-in-out ${transformClass}`}
    >
      <div className="max-w-360 mx-auto px-4 md:px-8 py-3 flex items-center justify-between gap-4">
        <div className="flex items-center gap-4 md:gap-6 text-xs font-mono font-semibold text-muted-foreground uppercase tracking-widest">
          <span className="opacity-50">© {new Date().getFullYear()} Reprompt</span>

          <div className="hidden md:flex items-center gap-4">
            <Link href={`/${lang}/terms`} className="hover:text-foreground transition-colors">
              {t("common.terms")}
            </Link>

            <Link href={`/${lang}/privacy`} className="hover:text-foreground transition-colors">
              {t("common.privacy")}
            </Link>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <LanguageSwitcher />

          <Link
            href={`/${lang}/legal`}
            className="md:hidden text-xs font-mono font-semibold text-muted-foreground uppercase tracking-widest hover:text-foreground transition-colors"
          >
            {t("common.legal")}
          </Link>

          <span className="px-2.5 py-1 bg-accent text-white text-xs font-black uppercase tracking-widest rounded-md shadow-[2px_2px_0px_0px_rgba(0,0,0,0.2)] dark:shadow-[2px_2px_0px_0px_rgba(255,255,255,0.1)] cursor-default select-none hidden sm:inline-block">
            BETA v1.0
          </span>
        </div>
      </div>
    </footer>
  );
}
