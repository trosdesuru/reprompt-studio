import { MediaCardData, GalleryItem } from "@/src/types/gallery";

export const mapSearchToMediaCard = (item: GalleryItem): MediaCardData => {
  return {
    id: item.gid || crypto.randomUUID(),
    imageUrl: item.thumb || "",
    title: item.title || "Sin título",
    tags: item.tags || [],
    source: "E-Hentai",
    aspectRatio: "portrait",
  };
};

export const mapViewerToMediaCard = (page: any, index: number): MediaCardData => {
  return {
    id: `page-${index}-${page.image_url || crypto.randomUUID()}`,
    imageUrl: page.image_url || "",
    title: page.name || `Página ${index + 1}`,
    prompt: page.prompt || undefined,
    aspectRatio: "auto",
  };
};
