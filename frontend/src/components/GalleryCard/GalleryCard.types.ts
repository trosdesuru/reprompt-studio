import { GalleryItem } from "@/src/types/gallery";

export interface GalleryCardProps {
  item: GalleryItem;
  onOpenVisor: (item: GalleryItem) => void;
  onDownloadTotal: (item: GalleryItem) => void;
}
