"use useState";
import { useState } from "react";
import toast from "react-hot-toast";

export function useDownloadImage() {
  const [isDownloading, setIsDownloading] = useState(false);

  const downloadImage = async (imageUrl: string | null, promptTitle?: string) => {
    if (!imageUrl) {
      toast.error("No hay imagen para descargar");
      return;
    }

    setIsDownloading(true);
    try {
      const response = await fetch(imageUrl);
      if (!response.ok) throw new Error("Network response was not ok");

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);

      const link = document.createElement("a");
      link.href = url;

      const safeName = (promptTitle || "reprompt_image").replace(/[^a-z0-9]/gi, "_").toLowerCase();
      link.download = `${safeName}.png`;

      document.body.appendChild(link);
      link.click();

      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      toast.success("Imagen descargada");
    } catch (error) {
      console.error("Error downloading image:", error);
      toast.error("Error al descargar la imagen");

      window.open(imageUrl, "_blank");
    } finally {
      setIsDownloading(false);
    }
  };

  return { downloadImage, isDownloading };
}
