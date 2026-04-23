"use client";

import { useTheme } from "next-themes";
import { MenuItem } from "@/src/system/atoms/Dropdown/MenuItem";
import { IconSun, IconMoon, IconDeviceDesktop } from "@tabler/icons-react";
import { useEffect, useState } from "react";

export function ThemeMenuItem() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  if (!mounted) return <MenuItem icon={<IconDeviceDesktop size={16} />} label="Tema" disabled />;

  const isDark = theme === "dark";

  return (
    <MenuItem
      icon={
        isDark ? (
          <IconSun size={16} className="text-yellow-500" />
        ) : (
          <IconMoon size={16} className="text-slate-600" />
        )
      }
      label={isDark ? "Cambiar a modo claro" : "Cambiar a modo oscuro"}
      onClick={() => setTheme(isDark ? "light" : "dark")}
    />
  );
}
