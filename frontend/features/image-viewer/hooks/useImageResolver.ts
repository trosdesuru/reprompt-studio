import { useState, useEffect, useRef } from "react";
import { api } from "@/src/services/api";

export function useImageResolver(pageUrl: string, index: number, galleryTitle: string) {
  const [imageUrl, setImageUrl] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isVisible, setIsVisible] = useState<boolean>(false);
  const [downloadStatus, setDownloadStatus] = useState<"idle" | "loading" | "success" | "error">(
    "idle",
  );

  // Referencia para el Intersection Observer
  const cardRef = useRef<HTMLDivElement>(null);

  // 1. Lógica de Observación (Lazy Loading)
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setIsVisible(true);
          observer.disconnect(); // Dejamos de observar una vez visible
        }
      },
      { rootMargin: "300px" }, // Cargamos la imagen 300px antes de que entre en pantalla
    );

    if (cardRef.current) observer.observe(cardRef.current);
    return () => observer.disconnect();
  }, []);

  // 2. Lógica de Resolución (Extracción de EH)
  useEffect(() => {
    if (!isVisible) return;

    // Evitamos bombardear al servidor de golpe escalonando las peticiones
    const delayMs = (index % 40) * 100;
    const timeoutId = setTimeout(async () => {
      setIsLoading(true);
      try {
        const data = await api.resolverImagen(pageUrl);
        if (data.status === "success" && data.url_img) {
          setImageUrl(data.url_img);
        }
      } catch (e) {
        console.error(`Error al resolver imagen ${index}:`, e);
      } finally {
        setIsLoading(false);
      }
    }, delayMs);

    return () => clearTimeout(timeoutId);
  }, [pageUrl, isVisible, index]);

  // 3. Lógica de Descarga Individual
  const handleDownload = async () => {
    if (!imageUrl) return;
    setDownloadStatus("loading");
    try {
      await api.descargarImagen(imageUrl, galleryTitle, index);
      setDownloadStatus("success");
    } catch (error) {
      console.error(`Error descargando imagen ${index}:`, error);
      setDownloadStatus("error");
    } finally {
      setTimeout(() => setDownloadStatus("idle"), 2500); // Reseteamos el botón tras 2.5s
    }
  };

  // Exponemos SOLO lo que la interfaz necesita
  return {
    cardRef,
    imageUrl,
    isLoading,
    isVisible,
    downloadStatus,
    handleDownload,
  };
}
