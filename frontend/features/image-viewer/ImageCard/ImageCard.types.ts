import { ViewerPageItem } from "@/src/types/gallery";

export interface ImageCardProps {
  item: ViewerPageItem;
  index: number;
  galleryTitle: string;
  onOpenImage: () => void;
}