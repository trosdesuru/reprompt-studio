export type MediaVariant = "gallery" | "viewer" | "search";
export type AspectRatio = "portrait" | "landscape" | "square" | "auto";

// Contrato agnóstico (Frontend puro)
export interface MediaCardData {
  id: string | number;
  imageUrl: string;
  title: string;
  prompt?: string;
  tags?: string[];
  source?: string;
  aspectRatio?: AspectRatio;
}

// Contrato del Backend/Scraper (Datos crudos)
export interface GalleryItem {
  gid: string;
  token: string;
  title: string;
  thumb: string;
  tags?: string[];
  [key: string]: any;
}
