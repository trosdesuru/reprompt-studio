"use client";

import { IconCircleCheckFilled, IconCircle } from "@tabler/icons-react";
import { ThemePreview } from "./ThemePreview";
import { THEME_CONFIGS, ThemeOption } from "../constants/themeConfigs";
import { BrandText } from "@/src/system/atoms/BrandText";

interface ThemeSelectorCardProps {
  themeType: ThemeOption;
  isActive: boolean;
  onClick: () => void;
}

export function ThemeSelectorCard({ themeType, isActive, onClick }: ThemeSelectorCardProps) {
  const config = THEME_CONFIGS[themeType] || THEME_CONFIGS.light;

  return (
    <button
      onClick={onClick}
      type="button"
      className={`
        flex flex-col text-left transition-all duration-200 rounded-xl overflow-hidden border-2 cursor-pointer group outline-none h-full
        ${
          isActive
            ? "border-primary ring-1 ring-primary shadow-sm"
            : "border-border/50 hover:border-border hover:shadow-sm"
        }
      `}
    >
      <ThemePreview colors={config.colors} />

      <div className="p-4 flex items-start justify-between w-full bg-background flex-1">
        <div className="flex flex-col pr-4">
          <span className="font-mono font-bold text-md text-foreground">{config.title}</span>
          <span className="font-mono text-sm text-muted-foreground mt-1 leading-relaxed">
            <BrandText text={config.description} />
          </span>
        </div>

        <div
          className={`transition-colors shrink-0 ${isActive ? "text-primary" : "text-muted-foreground group-hover:text-foreground"}`}
        >
          {isActive ? <IconCircleCheckFilled size={20} /> : <IconCircle size={20} stroke={1.5} />}
        </div>
      </div>
    </button>
  );
}
