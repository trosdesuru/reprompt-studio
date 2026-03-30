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

export interface AgnosticImageCard {
  id: string | number;
  imageUrl: string;
  title: string;
  prompt?: string;
  tags?: string[];
  source?: string;
  aspectRatio?: "portrait" | "landscape" | "square";
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
