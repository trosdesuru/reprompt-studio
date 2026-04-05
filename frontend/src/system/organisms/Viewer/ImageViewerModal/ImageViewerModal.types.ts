import { GalleryItem } from "@/src/types/gallery";

export interface ImageViewerModalProps {
  title: string;
  pages: GalleryItem;
  isLoading: boolean;
  isLoadingMore?: boolean;
  hasMorePages?: boolean;
  onLoadMore?: () => void;
  onClose: () => void;
}
