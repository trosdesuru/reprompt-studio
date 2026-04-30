"use client";
import { useTheme } from "@/src/utils/hooks/useTheme";
import { ThemeSelectorCard } from "@/src/features/theme/components/ThemeSelectorCard";

export default function AppearanceSettingsView() {
  const { theme, setTheme, mounted } = useTheme();

  if (!mounted) return null;

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <ThemeSelectorCard
        themeType="light"
        isActive={theme === "light"}
        onClick={() => setTheme("light")}
      />
      <ThemeSelectorCard
        themeType="dark"
        isActive={theme === "dark"}
        onClick={() => setTheme("dark")}
      />
      <ThemeSelectorCard
        themeType="system"
        isActive={theme === "system"}
        onClick={() => setTheme("system")}
      />
    </div>
  );
}
