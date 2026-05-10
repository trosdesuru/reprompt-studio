"use client";

import { IconStar, IconBookmark } from "@tabler/icons-react";
import { useTranslation } from "@/src/dictionaries/I18nProvider";
import { SidebarHeading } from "@/src/system/organisms/Sidebar/SidebarHeading";

export function SidebarExploreSection() {
  const { t } = useTranslation();

  return (
    <>
      <div className="px-3 pt-4 pb-2">
        <SidebarHeading>{t("studio.sidebar_section_explore") || "Explorar"}</SidebarHeading>
      </div>

      <div className="px-3 flex flex-col gap-1 mb-4">
        <button className="flex items-center gap-3 px-2 py-2 rounded-md hover:bg-muted/50 text-muted-foreground hover:text-foreground transition-colors w-full text-left">
          <IconStar size={18} stroke={1.5} />
          <span className="text-sm font-mono tracking-wide">
            {t("studio.favorites") || "Favoritos"}
          </span>
        </button>

        <button className="flex items-center gap-3 px-2 py-2 rounded-md hover:bg-muted/50 text-muted-foreground hover:text-foreground transition-colors w-full text-left">
          <IconBookmark size={18} stroke={1.5} />
          <span className="text-sm font-mono tracking-wide">
            {t("studio.saved_collections") || "Colecciones Guardadas"}
          </span>
        </button>
      </div>
    </>
  );
}
