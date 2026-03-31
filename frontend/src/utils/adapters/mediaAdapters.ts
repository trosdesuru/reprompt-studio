import { MediaCardData } from "@/src/types/gallery";

/**
 * Adaptador: Mapea cualquier resultado de búsqueda/trending a nuestro contrato universal
 */
export const mapSearchToMediaCard = (item: any): MediaCardData => {
  return {
    id: item.gid || item.id || crypto.randomUUID(),
    imageUrl: item.thumb || item.url || "",
    title: item.title || "Sin título",
    tags: item.tags || [],
    source: item.source || "E-Hentai",
    aspectRatio: "portrait", // Por defecto para E-Hentai
  };
};

/**
 * Adaptador: Mapea las páginas del visor a nuestro contrato universal
 */
export const mapViewerToMediaCard = (page: any, index: number): MediaCardData => {
  return {
    id: `page-${index}-${page.image_url}`,
    imageUrl: page.image_url || "",
    title: page.name || `Página ${index + 1}`,
    prompt: page.prompt || undefined,
    aspectRatio: "auto", 
  };
};
