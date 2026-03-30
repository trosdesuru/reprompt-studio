"use client";
import * as React from "react";
import { EH_CATEGORIES } from "@/src/constants/filters";
import { IconChevronDown } from "@tabler/icons-react";
import {
  Combobox,
  ComboboxChips,
  ComboboxChipsInput,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxItem,
  ComboboxList,
  ComboboxValue,
  useComboboxAnchor,
} from "@/components/ui/combobox";

interface Props {
  activeCategories: Record<string, boolean>;
  onToggle: (id: string) => void;
}

export function SearchCategorySelector({ activeCategories, onToggle }: Props) {
  const anchor = useComboboxAnchor();

  const selectedLabels = React.useMemo(
    () => EH_CATEGORIES.filter((c) => activeCategories[c.id]).map((c) => c.label),
    [activeCategories],
  );

  return (
    <Combobox
      multiple
      items={EH_CATEGORIES.map((c) => c.label)}
      value={selectedLabels}
      onValueChange={(labels) => {
        EH_CATEGORIES.forEach((c) => {
          const isActive = !!activeCategories[c.id];
          const shouldBeActive = labels.includes(c.label);
          if (isActive !== shouldBeActive) onToggle(c.id);
        });
      }}
    >
      {/* 🟢 FIX: Restauramos ComboboxChips original, pero con nuestros estilos */}
      <ComboboxChips
        ref={anchor}
        className="relative w-140px h-full flex items-center px-3 bg-muted/60 dark:bg-white/5 border-transparent border-r-border/50 cursor-pointer hover:bg-muted transition-colors rounded-none shadow-none"
      >
        <ComboboxValue>
          {(values) => (
            <div className="flex items-center justify-between w-full pointer-events-none z-10">
              {values.length === 0 ? (
                <span className="text-[11px] font-bold text-muted-foreground uppercase">
                  Filtros
                </span>
              ) : (
                <span className="text-[11px] font-black text-(--accent-color) uppercase tracking-tight">
                  {values.length === EH_CATEGORIES.length ? "Todo" : `${values.length} CAT`}
                </span>
              )}
              <IconChevronDown size={14} className="text-muted-foreground" />
            </div>
          )}
        </ComboboxValue>

        <ComboboxChipsInput
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-20"
          readOnly
        />
      </ComboboxChips>

      <ComboboxContent
        anchor={anchor}
        className="z-101 min-w-200px bg-background border border-border shadow-xl"
      >
        <ComboboxEmpty className="p-2 text-xs text-muted-foreground">
          No hay categorías.
        </ComboboxEmpty>
        <ComboboxList className="max-h-300px overflow-y-auto">
          {(item) => {
            const cat = EH_CATEGORIES.find((c) => c.label === item);
            const isActive = cat ? activeCategories[cat.id] : false;

            return (
              <ComboboxItem
                key={item}
                value={item}
                className="text-xs font-medium cursor-pointer p-2 hover:bg-muted"
              >
                <div className="flex items-center justify-between w-full">
                  {item}
                  {isActive && (
                    <div className="w-1.5 h-1.5 bg-(--accent-color) rounded-full shadow-[0_0_5px_var(--accent-color)]" />
                  )}
                </div>
              </ComboboxItem>
            );
          }}
        </ComboboxList>
      </ComboboxContent>
    </Combobox>
  );
}
