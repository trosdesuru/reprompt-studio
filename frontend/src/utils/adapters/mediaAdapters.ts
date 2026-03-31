import { MediaCardData, GalleryItem } from "@/src/types/gallery";

export const mapSearchToMediaCard = (item: GalleryItem): MediaCardData => {
  return {
    id: item?.gid || item?.url || crypto.randomUUID(), 
    imageUrl: item?.thumb || "",
    title: item?.title || "Sin título",
    tags: item?.tags || [],
    source: "E-Hentai",
    aspectRatio: "portrait",
  };
};

export const mapViewerToMediaCard = (page: any, index: number): MediaCardData => {
  const url = page?.image_url || "";
  return {
    id: `page-${index}-${url || index}`,
    imageUrl: url,
    title: page?.name || `Página ${index + 1}`,
    prompt: page?.prompt || undefined,
    aspectRatio: "auto",
  };
};
