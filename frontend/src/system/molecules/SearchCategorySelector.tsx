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
      {/* IMPORTANTE: El div con el anchor debe estar presente. 
         Añadimos type="button" para evitar que el click refresque o haga submit 
      */}
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
                <span className="text-[11px] font-black text-(--accent-color) uppercase tracking-tight">
                  {values.length === EH_CATEGORIES.length ? "Todo" : `${values.length} CAT`}
                </span>
              )}
            </div>
          )}
        </ComboboxValue>
        <IconChevronDown
          size={14}
          className="text-muted-foreground group-hover:text-foreground transition-transform"
        />
      </div>

      {/* FIX: Forzamos el portal o el z-index alto y revisamos el anclaje
       */}
      <ComboboxContent
        anchor={anchor}
        className="z-101 min-w-220px bg-background border border-border shadow-2xl animate-in fade-in zoom-in-95 duration-100"
      >
        <ComboboxEmpty className="p-2 text-xs text-muted-foreground">
          No hay categorías.
        </ComboboxEmpty>
        <ComboboxList className="p-1 max-h-300px overflow-y-auto">
          {EH_CATEGORIES.map((cat) => (
            <ComboboxItem
              key={cat.id}
              value={cat.label}
              className="text-xs font-medium cursor-pointer p-2 rounded-sm hover:bg-muted"
            >
              <div className="flex items-center justify-between w-full">
                {cat.label}
                {activeCategories[cat.id] && (
                  <div className="w-1.5 h-1.5 bg-(--accent-color) rounded-full" />
                )}
              </div>
            </ComboboxItem>
          ))}
        </ComboboxList>
      </ComboboxContent>
    </Combobox>
  );
}
