"use client"
import * as React from "react"
import { IconChevronDown } from "@tabler/icons-react"
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
} from "@/components/ui/combobox"

interface Option {
  id: string;
  label: string;
}

interface Props {
  options: Option[];
  activeCategories: Record<string, boolean>;
  onToggle: (id: string) => void;
}

export function SearchCategorySelector({ options, activeCategories, onToggle }: Props) {
  const anchor = useComboboxAnchor();
  
  const selectedLabels = React.useMemo(() => 
    options.filter(c => activeCategories[c.id]).map(c => c.label)
  , [options, activeCategories]);

  const handleValueChange = React.useCallback((labels: string[]) => {
    options.forEach(c => {
      const isActive = !!activeCategories[c.id];
      const shouldBeActive = labels.includes(c.label);
      if (isActive !== shouldBeActive) onToggle(c.id);
    });
  }, [options, activeCategories, onToggle]);

  return (
    <Combobox
      multiple
      items={options.map(c => c.label)}
      value={selectedLabels}
      onValueChange={handleValueChange}
    >
      <ComboboxChips 
        ref={anchor} 
        className="relative w-140px h-full flex items-center px-3 bg-muted/60 dark:bg-white/5 border-transparent border-r-border/50 cursor-pointer hover:bg-muted transition-colors rounded-none shadow-none"
      >
        <ComboboxValue>
          {(values) => (
            <div className="flex items-center justify-between w-full pointer-events-none z-10">
              {values.length === 0 ? (
                <span className="text-[11px] font-bold text-muted-foreground uppercase">Filtros</span>
              ) : (
                <span className="text-[11px] font-black text-var(--accent-color) uppercase tracking-tight">
                  {values.length === options.length ? "Todo" : `${values.length} CAT`}
                </span>
              )}
              <IconChevronDown size={14} className="text-muted-foreground" />
            </div>
          )}
        </ComboboxValue>
        <ComboboxChipsInput className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-20" readOnly />
      </ComboboxChips>

      <ComboboxContent anchor={anchor} className="z-101 min-w-200px bg-background border border-border shadow-xl">
        <ComboboxEmpty className="p-2 text-xs text-muted-foreground">No hay categorías.</ComboboxEmpty>
        <ComboboxList className="max-h-300px overflow-y-auto">
          {(item) => {
            const cat = options.find(c => c.label === item);
            const isActive = cat ? activeCategories[cat.id] : false;
            
            return (
              <ComboboxItem key={item} value={item} className="text-xs font-medium cursor-pointer p-2 hover:bg-muted">
                <div className="flex items-center justify-between w-full">
                  {item}
                  {isActive && <div className="w-1.5 h-1.5 bg-var(--accent-color) rounded-full shadow-[0_0_5px_var(--accent-color)]" />}
                </div>
              </ComboboxItem>
            );
          }}
        </ComboboxList>
      </ComboboxContent>
    </Combobox>
  )
}
