"use client";

import { usePathname, useRouter, useParams } from "next/navigation";

export function LanguageSwitcher() {
  const pathname = usePathname();
  const router = useRouter();
  const params = useParams();

  const currentLang = (params?.lang as string) || "es";

  const switchLanguage = (newLang: string) => {
    if (currentLang === newLang) return;

    const pathSegments = pathname.split("/");
    pathSegments[1] = newLang;

    const newUrl = pathSegments.join("/");

    router.push(newUrl);
    router.refresh();
  };

  return (
    <div className="flex items-center gap-3">
      <span className="text-sm font-mono text-muted-foreground uppercase">Idioma:</span>
      <div className="flex items-center gap-1 bg-muted/20 p-1 rounded-md border border-border">
        <button
          onClick={() => switchLanguage("es")}
          className={`px-3 py-1 text-xs font-black uppercase font-mono rounded transition-colors ${
            currentLang === "es"
              ? "bg-foreground text-background"
              : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
          }`}
        >
          ES
        </button>
        <button
          onClick={() => switchLanguage("en")}
          className={`px-3 py-1 text-xs font-black uppercase font-mono rounded transition-colors ${
            currentLang === "en"
              ? "bg-foreground text-background"
              : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
          }`}
        >
          EN
        </button>
      </div>
    </div>
  );
}
