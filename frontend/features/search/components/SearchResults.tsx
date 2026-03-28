// frontend/features/search/components/SearchResults.tsx
import { GalleryCard } from "@/src/components/GalleryCard";
import { Button } from "@/src/components/ui/Button";
import { GalleryItem } from "@/src/types/gallery";

interface SearchResultsProps {
  results: GalleryItem[];
  hasMore: boolean;
  isLoadingMore: boolean;
  onLoadMore: () => void;
  onOpenVisor: (item: GalleryItem) => void;
  onDownloadTotal: (item: GalleryItem) => void;
}

export function SearchResults({
  results,
  hasMore,
  isLoadingMore,
  onLoadMore,
  onOpenVisor,
  onDownloadTotal,
}: SearchResultsProps) {
  if (results.length === 0) return null;

  return (
    <div className="mt-8 border-t-2 border-(--border-color) pt-8">
      <h3 className="text-xl font-black font-mono uppercase mb-6 opacity-50">
        Resultados de Búsqueda
      </h3>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-8">
        {results.map((item, index) => (
          <GalleryCard
            key={`${item.url}-${index}`}
            item={item}
            onOpenVisor={onOpenVisor}
            onDownloadTotal={onDownloadTotal}
          />
        ))}
      </div>

      {hasMore && (
        <div className="flex justify-center mt-16 mb-12">
          <Button onClick={onLoadMore} isLoading={isLoadingMore} variant="secondary" size="lg">
            {isLoadingMore ? "Cargando..." : "↓ Ver más resultados"}
          </Button>
        </div>
      )}
    </div>
  );
}
