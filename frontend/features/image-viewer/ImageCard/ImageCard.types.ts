export interface ImageCardProps {
  pageUrl: string;
  index: number;
  galleryTitle: string;
  onOpenImage: (imgUrl: string) => void;
}