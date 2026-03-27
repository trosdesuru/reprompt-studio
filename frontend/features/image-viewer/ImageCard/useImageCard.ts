// frontend/features/image-viewer/ImageCard/useImageCard.ts
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
  const debounceTimer = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (entry.isIntersecting) {
          // 🟢 UX: Solo marcamos como visible si el usuario se queda parado 250ms
          // Esto evita cargar imágenes mientras el usuario hace scroll rápido hacia el final.
          debounceTimer.current = setTimeout(() => {
            setIsVisible(true);
          }, 250);
        } else {
          // Si sale del viewport antes de los 250ms, cancelamos la carga
          if (debounceTimer.current) clearTimeout(debounceTimer.current);
          // Opcional: Podrías poner isVisible(false) si quieres liberar memoria,
          // pero para miniaturas mejor mantenerlas una vez cargadas.
        }
      },
      {
        rootMargin: "100px", // Cargamos un poco antes de que entre en pantalla
        threshold: 0.1,
      },
    );

    if (cardRef.current) observer.observe(cardRef.current);
    return () => {
      observer.disconnect();
      if (debounceTimer.current) clearTimeout(debounceTimer.current);
    };
  }, []);

  useEffect(() => {
    // Si no es visible o ya tenemos la imagen, no hacemos nada
    if (!isVisible || imageUrl || isLoading) return;

    const fetchImage = async () => {
      setIsLoading(true);
      try {
        const data = await api.resolverImagen(pageUrl);
        if (data.status === "success" && data.url_img) {
          setImageUrl(data.url_img);
        }
      } catch (e) {
        console.error(`Error en pág ${index}:`, e);
      } finally {
        setIsLoading(false);
      }
    };

    fetchImage();
  }, [isVisible, pageUrl, imageUrl]); // Quitamos el index del delay, ahora es por visibilidad real

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
