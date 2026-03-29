import { ViewerPageItem } from "@/src/types/gallery";

export interface ImageViewerModalProps {
  title: string;
  pages: ViewerPageItem[];
  isLoading: boolean;
  isLoadingMore?: boolean;
  hasMorePages?: boolean;
  onLoadMore?: () => void;
  onClose: () => void;
}
