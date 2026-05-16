"use client";
import { useTheme } from "@/src/utils/hooks/useTheme";
import { ThemeSelectorCard } from "@/src/features/theme/components/ThemeSelectorCard";
import { SettingsSectionHeader } from "@/src/features/settings/components/SettingsSectionHeader";
import { IconDeviceDesktop } from "@tabler/icons-react";

export default function AppearanceSettingsView() {
  const { theme, setTheme, mounted } = useTheme();

  if (!mounted) return null;

  return (
    <div className="animate-fade-in space-y-8 w-full">
      <SettingsSectionHeader
        title="Apariencia"
        description="Gestiona tu contraseña y protege tu cuenta de Reprompt."
        icon={<IconDeviceDesktop size={24} />}
      />
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
    </div>
  );
}
