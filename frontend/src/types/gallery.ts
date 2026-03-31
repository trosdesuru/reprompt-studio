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

// --- TIPOS RAW DEL BACKEND (Capa de Datos) ---
export interface GalleryItem {
  gid: string;
  token: string;
  title: string;
  thumb: string;
  tags?: string[];
  [key: string]: any; // Permite cualquier otra propiedad extra del scraper
}
