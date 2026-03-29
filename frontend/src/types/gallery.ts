// frontend/src/types/gallery.ts

export interface GalleryItem {
  id?: string;
  url: string;
  title: string;
  title_raw?: string;
  tags_extracted?: string[];
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
  offset?: string;
  width?: number;
  height?: number;
}

export interface GalleryMetrics {
  total_views: number;
  total_downloads: number;
  top_galleries: GalleryItem[];
}
