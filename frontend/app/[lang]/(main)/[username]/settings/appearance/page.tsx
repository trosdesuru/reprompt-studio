"use client";

import { SettingsSectionHeader } from "@/src/features/settings/components/SettingsSectionHeader";
import { useTheme } from "@/src/utils/hooks/useTheme";
import { IconSun, IconMoon, IconDeviceDesktopFilled } from "@tabler/icons-react";

export default function AppearanceSettingsPage() {
  const { isDark, toggleTheme } = useTheme();

  return (
    <div className="max-w-3xl animate-fade-in">
      <SettingsSectionHeader
        title="Opciones de Tema"
        description="Personaliza cómo se ve Reprompt en este dispositivo."
        icon={<IconDeviceDesktopFilled className="text-accent-color" size={24} />}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* TEMA CLARO */}
        <button
          // 🟢 Si está en oscuro, el click lo cambia. Si ya está en claro, no hace nada.
          onClick={() => isDark && toggleTheme()}
          className={`flex flex-col items-start gap-4 p-4 text-left transition-all ${
            !isDark // 🟢 Evaluamos si NO es oscuro (es decir, es claro)
              ? "neo-border border-(--accent-color) bg-(--accent-color)/5 neo-shadow-accent"
              : "neo-border bg-background hover:neo-shadow"
          }`}
        >
          {/* Mini-Preview UI (Imita la interfaz de Reprompt) */}
          <div className="w-full h-32 bg-gray-100 border-2 border-gray-300 rounded-sm flex flex-col p-2 gap-2">
            <div className="w-full h-4 bg-white border border-gray-200"></div>
            <div className="flex gap-2 flex-1">
              <div className="w-1/3 h-full bg-gray-200"></div>
              <div className="w-2/3 h-full bg-white border border-gray-200"></div>
            </div>
          </div>
          <div className="flex items-center gap-2 font-bold uppercase tracking-wider text-sm w-full">
            <IconSun size={20} className={!isDark ? "text-(--accent-color)" : "text-foreground"} />
            Tema Claro
            {!isDark && (
              <span className="ml-auto text-xs bg-(--accent-color) text-white px-2 py-0.5">
                Activo
              </span>
            )}
          </div>
        </button>

        {/* TEMA OSCURO */}
        <button
          // 🟢 Si no está en oscuro (está en claro), el click lo cambia.
          onClick={() => !isDark && toggleTheme()}
          className={`flex flex-col items-start gap-4 p-4 text-left transition-all ${
            isDark
              ? "neo-border border-(--accent-color) bg-(--accent-color)/5 neo-shadow-accent"
              : "neo-border bg-[#0a0a0a] border-gray-800 hover:neo-shadow"
          }`}
        >
          {/* Mini-Preview UI Oscuro */}
          <div className="w-full h-32 bg-[#121212] border-2 border-gray-800 rounded-sm flex flex-col p-2 gap-2">
            <div className="w-full h-4 bg-[#1a1a1a] border border-gray-800"></div>
            <div className="flex gap-2 flex-1">
              <div className="w-1/3 h-full bg-[#1e1e1e]"></div>
              <div className="w-2/3 h-full bg-[#1a1a1a] border border-gray-800"></div>
            </div>
          </div>
          <div className="flex items-center gap-2 font-bold uppercase tracking-wider text-sm text-white w-full">
            <IconMoon size={20} className={isDark ? "text-(--accent-color)" : "text-gray-400"} />
            Tema Oscuro
            {isDark && (
              <span className="ml-auto text-xs bg-(--accent-color) text-white px-2 py-0.5">
                Activo
              </span>
            )}
          </div>
        </button>
      </div>
    </div>
  );
}
