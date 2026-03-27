// frontend/features/search/components/FilterBar.tsx
import { EH_CATEGORIES } from "@/src/constants/filters";

interface FilterBarProps {
  activeCategories: Record<string, boolean>;
  toggleCategory: (id: string) => void;
}

export default function FilterBar({ activeCategories, toggleCategory }: FilterBarProps) {
  return (
    <div className="max-w-4xl mx-auto mb-6">
      <div className="flex flex-wrap justify-center gap-2 p-4 bg-gray-800/50 rounded-xl border border-gray-700 shadow-inner">
        {EH_CATEGORIES.map((cat) => {
          const isActive = activeCategories[cat.id];
          return (
            <button
              key={cat.id}
              onClick={() => toggleCategory(cat.id)}
              className={`
                px-3 py-1 rounded text-xs font-bold transition-all duration-200 uppercase tracking-tighter
                ${
                  isActive
                    ? `${cat.color} ${cat.textColor} shadow-lg scale-105`
                    : "bg-gray-700 text-gray-400 grayscale opacity-50 hover:opacity-80"
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
