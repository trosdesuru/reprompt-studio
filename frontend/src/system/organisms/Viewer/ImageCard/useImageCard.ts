import { useState } from "react";
import { api } from "@/src/services/api";

export function useImageCard(pageUrl: string, index: number, galleryTitle: string) {
  const [downloadStatus, setDownloadStatus] = useState<"idle" | "loading" | "success" | "error">(
    "idle",
  );

  const handleDownload = async () => {
    setDownloadStatus("loading");
    try {
      // Pedimos la imagen en alta calidad SOLO cuando se pulsa descargar
      const res = await api.resolverImagen(pageUrl);
      if (res.status === "success" && res.url_img) {
        await api.descargarImagen(res.url_img, galleryTitle, index);
        setDownloadStatus("success");
      } else {
        throw new Error("No se pudo resolver la imagen");
      }
    } catch (error) {
      setDownloadStatus("error");
    } finally {
      setTimeout(() => setDownloadStatus("idle"), 2500);
    }
  };

  return { downloadStatus, handleDownload };
}
