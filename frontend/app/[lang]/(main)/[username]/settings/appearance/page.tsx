"use client";

import { SettingsSectionHeader } from "@/src/features/settings/components/SettingsSectionHeader";
import { ThemeSelectorCard } from "@/src/features/theme/components/ThemeSelectorCard";
import { useTheme } from "@/src/utils/hooks/useTheme";
import { IconDeviceDesktop } from "@tabler/icons-react";

export default function AppearanceSettingsPage() {
  const { isDark, toggleTheme } = useTheme();

  return (
    <div className="max-w-3xl animate-fade-in space-y-8">
      <SettingsSectionHeader
        title="Opciones de Tema"
        description="Personaliza cómo se ve Reprompt en este dispositivo."
        icon={<IconDeviceDesktop className="text-foreground" size={24} />}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <ThemeSelectorCard
          themeType="light"
          isActive={!isDark}
          onClick={() => isDark && toggleTheme()}
        />

        <ThemeSelectorCard
          themeType="dark"
          isActive={isDark}
          onClick={() => !isDark && toggleTheme()}
        />
      </div>
    </div>
  );
}
