import { GalleryItem } from "@/src/types/gallery";

export interface GalleryCardProps {
  item: GalleryItem;
  onOpenVisor: (url: string, title: string) => void;
  onDownloadTotal: (url: string, title: string) => void;
}
