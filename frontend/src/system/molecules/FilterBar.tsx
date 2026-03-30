import { EH_CATEGORIES } from "@/src/constants/filters";
import { FilterChip } from "../atoms/FilterChip";
import { Carousel, CarouselContent, CarouselItem } from "@/components/ui/carousel";

interface FilterBarProps {
  activeCategories: Record<string, boolean>;
  onToggle: (id: string) => void;
}

export function FilterBar({ activeCategories, onToggle }: FilterBarProps) {
  return (
    <div className="w-full mt-4">
      <Carousel opts={{ align: "start", dragFree: true }} className="w-full">
        <CarouselContent className="-ml-2">
          {EH_CATEGORIES.map((cat) => (
            <CarouselItem key={cat.id} className="pl-2 basis-auto">
              <FilterChip
                label={cat.label}
                isActive={!!activeCategories[cat.id]}
                onClick={() => onToggle(cat.id)}
              />
            </CarouselItem>
          ))}
        </CarouselContent>
      </Carousel>
    </div>
  );
}
