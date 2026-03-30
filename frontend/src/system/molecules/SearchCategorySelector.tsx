"use client";

import * as React from "react";
import { EH_CATEGORIES } from "@/src/constants/filters";
import { IconChevronDown } from "@tabler/icons-react";
import {
  Combobox,
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
      {/* Contenedor con ancho fijo y estilo diferenciado */}
      <div
        ref={anchor}
        className="w-140px h-full flex items-center justify-between px-3 bg-muted/60 dark:bg-white/5 border-r border-border/50 cursor-pointer hover:bg-muted transition-colors group"
      >
        <ComboboxValue>
          {(values) => (
            <div className="flex items-center gap-1 overflow-hidden">
              {values.length === 0 ? (
                <span className="text-[11px] font-bold text-muted-foreground uppercase">
                  Filtros
                </span>
              ) : (
                <div className="flex gap-1">
                  <span className="text-[11px] font-black text-(--accent-color) uppercase tracking-tight">
                    {values.length === EH_CATEGORIES.length ? "Todo" : `${values.length} CAT`}
                  </span>
                </div>
              )}
            </div>
          )}
        </ComboboxValue>
        <IconChevronDown
          size={14}
          className="text-muted-foreground group-hover:text-foreground transition-transform"
        />
      </div>

      <ComboboxContent anchor={anchor} className="z-100 min-w-200px">
        <ComboboxEmpty>No hay categorías.</ComboboxEmpty>
        <ComboboxList>
          {(item) => (
            <ComboboxItem key={item} value={item} className="text-xs font-medium">
              {item}
            </ComboboxItem>
          )}
        </ComboboxList>
      </ComboboxContent>
    </Combobox>
  );
}
