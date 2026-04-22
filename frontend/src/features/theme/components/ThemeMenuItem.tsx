"use client";

import { useTheme } from "@/src/utils/hooks/useTheme";
import { MenuItem } from "@/src/system/atoms/Menu/MenuItem";
import { IconSun, IconMoon } from "@tabler/icons-react";

export function ThemeMenuItem() {
  const { isDark, toggleTheme } = useTheme();

  return (
    <MenuItem
      icon={
        isDark ? (
          <IconSun size={18} className="text-yellow-500" />
        ) : (
          <IconMoon size={18} className="text-blue-500" />
        )
      }
      label={isDark ? "Modo Claro" : "Modo Oscuro"}
      onClick={toggleTheme}
    />
  );
}
