import { useState, useEffect, useRef } from "react";
import { api } from "@/src/services/api";

export function useImageCard(pageUrl: string, index: number, galleryTitle: string) {
  const [imageUrl, setImageUrl] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isVisible, setIsVisible] = useState<boolean>(false);
  const [downloadStatus, setDownloadStatus] = useState<"idle" | "loading" | "success" | "error">(
    "idle",
  );

  const cardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { rootMargin: "300px" },
    );
    if (cardRef.current) observer.observe(cardRef.current);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!isVisible) return;
    const delayMs = (index % 40) * 100;
    const timeoutId = setTimeout(async () => {
      setIsLoading(true);
      try {
        const data = await api.resolverImagen(pageUrl);
        if (data.status === "success" && data.url_img) setImageUrl(data.url_img);
      } catch (e) {
        console.error(`Error al resolver imagen ${index}:`, e);
      } finally {
        setIsLoading(false);
      }
    }, delayMs);
    return () => clearTimeout(timeoutId);
  }, [pageUrl, isVisible, index]);

  const handleDownload = async () => {
    if (!imageUrl) return;
    setDownloadStatus("loading");
    try {
      await api.descargarImagen(imageUrl, galleryTitle, index);
      setDownloadStatus("success");
    } catch (error) {
      setDownloadStatus("error");
    } finally {
      setTimeout(() => setDownloadStatus("idle"), 2500);
    }
  };

  return { cardRef, imageUrl, isLoading, isVisible, downloadStatus, handleDownload };
}
