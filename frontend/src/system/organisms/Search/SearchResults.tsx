import { GalleryItem } from "@/src/types/gallery";
import { GalleryCard } from "./GalleryCard";

interface Props {
  results: GalleryItem[];
  onOpenVisor: (item: GalleryItem) => void;
  onDownloadTotal: (item: GalleryItem) => void;
}

export function SearchResults({ results, onOpenVisor, onDownloadTotal }: Props) {
  if (!results || results.length === 0) return null;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 pb-20">
      {results.map((item) => (
        <GalleryCard
          key={item.id}
          item={item}
          onOpenVisor={onOpenVisor}
          onDownloadTotal={onDownloadTotal}
        />
      ))}
    </div>
  );
}
