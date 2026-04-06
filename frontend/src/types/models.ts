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

export interface FeedItem {
  id: string;
  raw_id: string;
  slug?: string;
  type: "prompt" | "collection" | "studio";
  title: string;
  username: string;
  image_url?: string;
  items_count: number;
}

export interface Collection {
  id: number;
  name: string;
  slug: string;
  description: string | null;
  is_private: boolean;
  created_at: string;
}

export interface SavedPrompt {
  id: number;
  title: string;
  prompt: string;
  model: string;
  resolution?: string;
  sampler?: string;
  image_url?: string;
  software?: string;
  collection_id?: number | null;
  created_at: string;
}

