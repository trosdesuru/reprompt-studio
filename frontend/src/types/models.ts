export type MediaVariant = "gallery" | "viewer" | "search";
export type AspectRatio = "portrait" | "landscape" | "square" | "auto";

export interface User {
  id: string;
  fullName?: string | null;
  username: string;
  email?: string;
  role: "voyager" | "artist" | "admin";
  profession?: string | null;
  age?: number;
  avatarUrl?: string | null;
  storage_used: number;
  prompts_count?: number;
  prompts_limit?: number;
  created_at?: string;

}

export interface SavedPrompt {
  id: number;
  user_id: string;
  title: string;
  prompt: string;
  negative_prompt?: string;
  model: string;
  resolution?: string;
  width?: number;
  height?: number;
  sampler?: string;
  lora?: string;
  steps?: number;
  cfg_scale?: number;
  seed?: string;
  image_url?: string;
  software?: string;
  auto_tags?: { name: string; confidence: number }[];
  trigger_words?: string[];
  directory_id?: number | null;
  created_at: string;
  extra_data?: string;
}

export interface MediaCardData {
  id: string | number;
  user_id: string;
  imageUrl: string;
  title: string;
  prompt?: string;
  tags?: string[];
  source?: string;
  aspectRatio?: AspectRatio;
}

export interface GalleryItem {
  url: string;
  user_id: string;
  title: string;
  thumb: string;
  gid?: string;
  token?: string;
  auto_tags?: string[];
  trigger_words?: string[];
  [key: string]: any;
}

export interface FeedItem {
  id: string;
  user_id: string;
  raw_id: string;
  slug?: string;
  type: "prompt" | "directory" | "studio";
  title: string;
  username: string;
  avatar_url?: string | null;
  image_url?: string;
  width?: number;
  height?: number;
  items_count: number;
  resolution?: string;
  created_at: string;
  model?: string;
}

export interface Directory {
  id: number;
  user_id: string;
  name: string;
  slug: string;
  description: string | null;
  is_private: boolean;
  created_at: string;
}
