// frontend/features/search/components/FilterBar.tsx
import { EH_CATEGORIES } from "@/src/constants/filters";

interface FilterBarProps {
  activeCategories: Record<string, boolean>;
  toggleCategory: (id: string) => void;
}

export default function FilterBar({ activeCategories, toggleCategory }: FilterBarProps) {
  return (
    <div className="max-w-4xl mx-auto mb-8">
      <div className="flex flex-wrap justify-center gap-3 p-5 bg-(--bg-secondary) neo-border neo-shadow">
        {EH_CATEGORIES.map((cat) => {
          const isActive = activeCategories[cat.id];
          
          return (
            <button
              key={cat.id}
              onClick={() => toggleCategory(cat.id)}
              className={`
                px-4 py-2 text-xs font-black uppercase tracking-widest transition-all duration-200 neo-border
                ${
                  isActive
                    ? `${cat.color} ${cat.textColor} neo-shadow-accent -translate-y-1`
                    : "bg-background text-(--text-secondary) hover:text-foreground hover:-translate-y-0.5"
                }
              `}
            >
              {cat.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}