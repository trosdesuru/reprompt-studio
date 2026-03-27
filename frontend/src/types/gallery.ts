// frontend/src/types/gallery.ts

export interface GalleryItem {
  url: string;
  title: string;
  thumb: string;

  views?: number;
  downloads?: number;
  tags?: string[];
  category?: string;
  added_at?: string;
}

export interface ViewerPageItem {
  page_url: string;
  thumb_url: string;
}

export interface GalleryMetrics {
  total_views: number;
  total_downloads: number;
  top_galleries: GalleryItem[];
}
