import { ViewerPageItem } from "@/src/types/gallery";

export interface ImageViewerModalProps {
  title: string;
  pages: ViewerPageItem[];
  isLoading: boolean;
  onClose: () => void;
}
