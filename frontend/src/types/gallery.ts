export type MediaVariant = "gallery" | "viewer" | "search";
export type AspectRatio = "portrait" | "landscape" | "square" | "auto";

export interface MediaCardData {
  id: string | number;
  imageUrl: string;
  title: string;
  prompt?: string;
  tags?: string[];
  source?: string;
  aspectRatio?: AspectRatio;
}

export interface GalleryItem {
  url: string;        // <-- CRÍTICO: Requerido por la API de interacciones
  title: string;
  thumb: string;
  gid?: string;       // Opcional, por si el scraper antiguo lo usa
  token?: string;     // Opcional
  tags?: string[];
  [key: string]: any;
}
