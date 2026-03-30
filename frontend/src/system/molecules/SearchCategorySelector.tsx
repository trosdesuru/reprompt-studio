"use client";
import * as React from "react";
import { EH_CATEGORIES } from "@/src/constants/filters";
import {
  Combobox,
  ComboboxChip,
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

  // Convertimos el objeto de estado a array para el componente
  const selectedValues = React.useMemo(
    () => EH_CATEGORIES.filter((c) => activeCategories[c.id]).map((c) => c.label),
    [activeCategories],
  );

  return (
    <Combobox
      multiple
      items={EH_CATEGORIES.map((c) => c.label)}
      value={selectedValues}
      onValueChange={(labels) => {
        // Lógica para sincronizar con tu store de Zustand
        EH_CATEGORIES.forEach((c) => {
          const isActive = activeCategories[c.id];
          const shouldBeActive = labels.includes(c.label);
          if (isActive !== shouldBeActive) onToggle(c.id);
        });
      }}
    >
      <ComboboxChips ref={anchor} className="w-full border-none bg-transparent p-0 min-h-32px">
        <ComboboxValue>
          {(values) => (
            <div className="flex flex-wrap gap-1">
              {values.map((value: string) => (
                <ComboboxChip key={value} className="text-[10px] h-6 bg-accent/20 border-accent/30">
                  {value}
                </ComboboxChip>
              ))}
              <ComboboxChipsInput placeholder="Filtrar por categoría..." className="text-xs" />
            </div>
          )}
        </ComboboxValue>
      </ComboboxChips>
      <ComboboxContent anchor={anchor} className="z-100">
        <ComboboxEmpty>No hay resultados.</ComboboxEmpty>
        <ComboboxList>
          {(item) => (
            <ComboboxItem key={item} value={item} className="text-xs">
              {item}
            </ComboboxItem>
          )}
        </ComboboxList>
      </ComboboxContent>
    </Combobox>
  );
}
