import { MediaCardData, GalleryItem } from "@/src/types/gallery";

export const mapSearchToMediaCard = (item: GalleryItem): MediaCardData => {
  // 🚨 SENSOR DE TRANSFORMACIÓN
  if (!item) console.error("🚨 TELEMETRÍA [ADAPTER]: Item recibido es NULO o UNDEFINED");
  if (item && !item.thumb) console.warn("🚨 TELEMETRÍA [ADAPTER]: Item no tiene imagen (thumb)", item);

  return {
    id: item?.gid || item?.url || crypto.randomUUID(), 
    imageUrl: item?.thumb || "",
    title: item?.title || "Sin título",
    tags: item?.tags || [],
    source: "E-Hentai",
    aspectRatio: "portrait",
  };
};

export const mapViewerToMediaCard = (page: any, index: number): MediaCardData => { /* ... */ return { id: `p-${index}`, imageUrl: page?.image_url || "", title: page?.name || "", aspectRatio: "auto" }; };
