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
  url: string;
  title: string;
  thumb: string;
  gid?: string;
  token?: string;
  tags?: string[];
  [key: string]: any;
}
