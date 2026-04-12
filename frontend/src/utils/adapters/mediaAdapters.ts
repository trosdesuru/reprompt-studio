import { MediaCardData, GalleryItem } from "@/src/types/models";

export const mapSearchToMediaCard = (item: GalleryItem): MediaCardData => {
  // 🚨 SENSOR DE TRANSFORMACIÓN
  if (!item && process.env.NODE_ENV === "development")
    console.error("🚨 TELEMETRÍA [ADAPTER]: Item recibido es NULO o UNDEFINED");
  if (item && !item.thumb && process.env.NODE_ENV === "development")
    console.warn("🚨 TELEMETRÍA [ADAPTER]: Item no tiene imagen (thumb)", item);

  return {
    id: item?.gid || item?.url || crypto.randomUUID(),
    user_id: item.user_id,
    imageUrl: item?.thumb || "",
    title: item?.title || "Sin título",
    tags: item?.tags || [],
    source: "E-Hentai",
    aspectRatio: "portrait",
  };
};

export const mapViewerToMediaCard = (page: any, index: number): MediaCardData => {
  /* ... */ return {
    user_id: "",
    id: `p-${index}`,
    imageUrl: page?.image_url || "",
    title: page?.name || "",
    aspectRatio: "auto",
  };
};
