"use client";

import Link from "next/link";
import { useParams } from "next/navigation";

import { useState, useEffect } from "react";
import { useTranslation } from "@/src/dictionaries/I18nProvider";

import { useAuthStore } from "@/src/store/authStore";
import { useTheme } from "@/src/utils/hooks/useTheme";

import { Tooltip } from "@/src/system/atoms/Tooltip/Tooltip";
import { UserDropdown } from "@/src/features/user/components/UserDropdown";
import { NotificationDropdown } from "@/src/system/molecules/Navbar/NotificationDropdown";

import { IconAlbum, IconSun, IconMoon, IconScanTraces } from "@tabler/icons-react";

export function NavbarActions() {
  const { t } = useTranslation();
  const params = useParams();
  const lang = params?.lang || "es";

  const user = useAuthStore((state) => state.user);
  const isLoadingAuth = useAuthStore((state) => state.isLoadingAuth);

  const { isDark, toggleTheme } = useTheme();
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return <div className="hidden md:flex w-200px h-10 shrink-0" />;
  }

  return (
    <div className="hidden md:flex items-center gap-1.5 lg:gap-1.5 shrink-0">
      {isLoadingAuth ? (
        <div className="w-32 h-9 rounded-lg bg-muted/40 animate-pulse"></div>
      ) : user ? (
        <>
          <div className="flex items-center gap-2">
            <Tooltip content={t("nav.my_studio_tooltip")} side="bottom">
              <Link
                href={`/${lang}/studio`}
                className="flex items-center gap-2 px-4 py-2 bg-foreground text-background rounded-lg text-sm font-bold hover:opacity-90 transition-opacity"
              >
                <IconAlbum size={18} />
                {t("nav.studio")}
              </Link>
            </Tooltip>

            <Tooltip
              content={t("nav.extractor_tooltip")}
              side="bottom"
              className="bg-accent text-secondary"
            >
              <Link
                href={`/${lang}/reprompt`}
                className="p-2 rounded-md text-muted-foreground hover:text-foreground transition-colors hover:bg-muted cursor-pointer"
                title={t("nav.extractor_tooltip")}
              >
                <IconScanTraces size={22} />
              </Link>
            </Tooltip>
          </div>

          <NotificationDropdown />

          <Tooltip content={t("nav.theme_tooltip")} side="bottom">
            <button
              onClick={toggleTheme}
              className="p-2 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted cursor-pointer transition-colors w-10 h-10 flex items-center justify-center"
              title={t("nav.theme_tooltip")}
            >
              {isDark ? <IconSun size={24} /> : <IconMoon size={24} />}
            </button>
          </Tooltip>

          <UserDropdown />
        </>
      ) : (
        <Link
          href={`/${lang}/login`}
          className="text-sm font-bold px-4 py-2 bg-foreground text-background rounded-lg hover:opacity-90 transition-opacity"
        >
          {t("nav.login")}
        </Link>
      )}
    </div>
  );
}
