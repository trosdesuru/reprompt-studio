// frontend/features/search/TrendingSection/TrendingSection.types.ts
import { GalleryItem } from "@/src/types/gallery";

export interface TrendingSectionProps {
  trending: GalleryItem[];
  // 🟢 Actualizamos las firmas para que reciban el objeto entero
  onOpenVisor: (item: GalleryItem) => void;
  onDownloadTotal: (item: GalleryItem) => void;
}
