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

interface SearchCategorySelectorProps {
  activeCategories: Record<string, boolean>;
  onToggleCategory: (id: string) => void;
}

export function SearchCategorySelector({
  activeCategories,
  onToggleCategory,
}: SearchCategorySelectorProps) {
  const anchor = useComboboxAnchor();

  // 1. Traducir el diccionario { misc: true } a ["Misc"] [cite: 288, 485]
  const selectedLabels = React.useMemo(() => {
    return EH_CATEGORIES.filter((cat) => activeCategories[cat.id]).map((cat) => cat.label);
  }, [activeCategories]);

  // 2. Traducir el cambio de Shadcn a nuestra función toggleCategory [cite: 485]
  const handleValueChange = (newValues: string[]) => {
    EH_CATEGORIES.forEach((cat) => {
      const isCurrentlyActive = activeCategories[cat.id];
      const isNowSelected = newValues.includes(cat.label);

      if (isCurrentlyActive !== isNowSelected) {
        onToggleCategory(cat.id);
      }
    });
  };

  return (
    <Combobox
      multiple
      autoHighlight
      items={EH_CATEGORIES.map((c) => c.label)}
      value={selectedLabels}
      onValueChange={handleValueChange}
    >
      <ComboboxChips
        ref={anchor}
        className="h-full border-border/50 bg-transparent hover:bg-muted/50 transition-colors rounded-l-lg rounded-r-none border-r max-w-200px overflow-hidden"
      >
        <ComboboxValue>
          {(values) => (
            <React.Fragment>
              {values.map((value: string) => (
                <ComboboxChip
                  key={value}
                  className="bg-(--accent-color)/10 text-(--accent-color) border-(--accent-color)/20 text-[10px] uppercase font-bold"
                >
                  {value}
                </ComboboxChip>
              ))}
              <ComboboxChipsInput
                placeholder="Filtrar..."
                className="text-xs placeholder:text-muted-foreground"
              />
            </React.Fragment>
          )}
        </ComboboxValue>
      </ComboboxChips>
      <ComboboxContent
        anchor={anchor}
        className="z-50 bg-background border border-border shadow-xl rounded-lg"
      >
        <ComboboxEmpty className="text-xs font-mono p-4 text-muted-foreground">
          No hay categorías.
        </ComboboxEmpty>
        <ComboboxList className="custom-scrollbar max-h-60">
          {(item) => (
            <ComboboxItem
              key={item}
              value={item}
              className="text-xs font-medium hover:bg-muted cursor-pointer"
            >
              {item}
            </ComboboxItem>
          )}
        </ComboboxList>
      </ComboboxContent>
    </Combobox>
  );
}
