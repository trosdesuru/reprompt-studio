// frontend/features/image-viewer/ImageViewerModal/components/ViewerLightbox.tsx
"use client";

import { useState, useEffect } from "react";
import { api } from "@/src/services/api";
import { ViewerPageItem } from "@/src/types/gallery";
import { Skeleton } from "@/src/components/ui/Skeleton";
import { Button } from "@/src/components/ui/Button";

interface ViewerLightboxProps {
  pages: ViewerPageItem[];
  selectedIndex: number;
  onClose: () => void;
  onNext: () => void;
  onPrev: () => void;
}

export function ViewerLightbox({
  pages,
  selectedIndex,
  onClose,
  onNext,
  onPrev,
}: ViewerLightboxProps) {
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // 🟢 EFECTO BLINDADO: Carga la imagen de forma segura sin fugas de memoria
  useEffect(() => {
    let isMounted = true;
    setIsLoading(true);
    setImageUrl(null); // Reseteamos la imagen al cambiar de página

    const fetchFullImage = async () => {
      try {
        const res = await api.resolverImagen(pages[selectedIndex].page_url);
        if (isMounted && res.status === "success" && res.url_img && res.url_img.trim() !== "") {
          setImageUrl(res.url_img);
        } else if (isMounted) {
          setImageUrl("error");
        }
      } catch (e) {
        if (isMounted) setImageUrl("error");
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    fetchFullImage();
    return () => {
      isMounted = false;
    };
  }, [selectedIndex, pages]);

  return (
    // Capa extra oscurecida al 95% para resaltar la imagen
    <div className="fixed inset-0 z-60 flex items-center justify-center bg-black/95 backdrop-blur-md animate-fade-in">
      {/* Botón de cerrar */}
      <Button
        variant="ghost"
        className="absolute top-4 right-6 text-white text-2xl z-70"
        onClick={onClose}
      >
        ✖
      </Button>

      {/* Controles laterales */}
      <button
        className="absolute left-4 top-1/2 -translate-y-1/2 text-white text-5xl z-70 hover:scale-110 transition-transform opacity-50 hover:opacity-100"
        onClick={onPrev}
      >
        ◀
      </button>

      {/* Contenedor central de la imagen */}
      <div className="relative max-w-6xl max-h-[90vh] w-full h-full flex items-center justify-center p-4 md:p-12">
        {isLoading ? (
          // 🟢 Skeleton elegante mientras el backend resuelve la imagen
          <Skeleton className="w-full h-full max-h-[80vh] rounded-lg opacity-20" />
        ) : imageUrl === "error" || !imageUrl ? (
          // 🟢 Prevención de bucles infinitos en el src=""
          <div className="text-red-500 font-mono font-bold text-xl neo-border p-8 bg-black/50">
            ❌ Error al resolver la imagen Full HD.
          </div>
        ) : (
          <img
            src={imageUrl}
            alt={`Página ${selectedIndex + 1}`}
            className="max-w-full max-h-full object-contain shadow-2xl animate-fade-in"
            referrerPolicy="no-referrer"
          />
        )}
      </div>

      <button
        className="absolute right-4 top-1/2 -translate-y-1/2 text-white text-5xl z-70 hover:scale-110 transition-transform opacity-50 hover:opacity-100"
        onClick={onNext}
      >
        ▶
      </button>

      {/* Indicador de página */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-white font-mono font-bold bg-black/50 px-4 py-2 neo-border">
        {selectedIndex + 1} / {pages.length}
      </div>
    </div>
  );
}
