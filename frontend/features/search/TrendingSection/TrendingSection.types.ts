import { GalleryItem } from "@/src/types/gallery";

export interface TrendingSectionProps {
  trending: GalleryItem[];
  onOpenVisor: (url: string, title: string) => void;
  onDownloadTotal: (url: string, title: string) => void;
}