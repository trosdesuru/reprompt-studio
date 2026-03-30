// frontend/features/image-viewer/ImageViewerModal/components/ViewerLightbox.tsx
import { useEffect, useState, useRef } from "react";
import { ViewerPageItem } from "@/src/types/gallery";
import { api } from "@/src/services/api";
import { Button } from "@/src/system/atoms/Button";

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
  const [highResUrl, setHighResUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const urlToFetch = pages[selectedIndex]?.page_url;

  // 🟢 LA CURA: Un diccionario en memoria RAM del navegador para recordar las URLs ya resueltas
  const resolvedCache = useRef<Record<string, string>>({});

  // 1. CARGA DE LA IMAGEN ACTUAL
  useEffect(() => {
    if (!urlToFetch) return;

    // Si ya resolvimos esta URL antes (por pre-carga o por volver atrás), la pintamos AL INSTANTE
    if (resolvedCache.current[urlToFetch]) {
      setHighResUrl(resolvedCache.current[urlToFetch]);
      setIsLoading(false);
      setError(null);
      return; 
    }

    let isCancelled = false;

    const fetchHighResImage = async () => {
      // Solo mostramos el Skeleton si de verdad no tenemos la imagen
      setIsLoading(true);
      setError(null);
      setHighResUrl(null);

      try {
        const res = await api.resolverImagen(urlToFetch);
        if (isCancelled) return;

        if (res.status === "success" && res.url_img) {
          resolvedCache.current[urlToFetch] = res.url_img; // Guardamos en memoria
          setHighResUrl(res.url_img);
        } else {
          setError("No se pudo cargar la imagen en alta calidad.");
        }
      } catch (err) {
        if (isCancelled) return;
        setError("Error de red al contactar con el servidor.");
        console.error("Error resolviendo imagen:", err);
      } finally {
        if (!isCancelled) {
          setIsLoading(false);
        }
      }
    };

    fetchHighResImage();

    return () => {
      isCancelled = true;
    };
  }, [urlToFetch]);

  // 2. LA MAGIA REAL: PRE-CARGA INVISIBLE DE LA SIGUIENTE IMAGEN
  useEffect(() => {
    if (selectedIndex >= pages.length - 1) return;

    const nextUrl = pages[selectedIndex + 1]?.page_url;
    if (!nextUrl) return;

    // Si ya la tenemos en memoria, no hacemos nada
    if (resolvedCache.current[nextUrl]) return;

    api.resolverImagen(nextUrl)
      .then((res) => {
        if (res.status === "success" && res.url_img) {
          // Guardamos la URL en nuestra memoria del Frontend
          resolvedCache.current[nextUrl] = res.url_img;
          // Obligamos al navegador a cachear los bytes
          const img = new Image();
          img.src = res.url_img; 
        }
      })
      .catch(() => {});
  }, [selectedIndex, pages]);

  if (!pages[selectedIndex]) return null;

  return (
    <div className="fixed inset-0 z-60 flex items-center justify-center bg-black/95 animate-fade-in">
      
      {/* Botón de Cerrar */}
      <button
        onClick={(e) => { e.stopPropagation(); onClose(); }}
        className="absolute top-6 right-6 z-70 bg-black/40 hover:bg-red-600/80 rounded-full text-white/70 hover:text-white transition-all p-3 shadow-lg"
        aria-label="Cerrar visor"
      >
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>

      {/* Navegación Izquierda */}
      {selectedIndex > 0 && (
        <button
          onClick={onPrev}
          className="absolute left-0 z-50 px-4 md:px-8 text-white/30 hover:text-white transition-colors h-full flex items-center hover:bg-linear-to-r hover:from-black/50 hover:to-transparent"
          aria-label="Imagen anterior"
        >
          <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
      )}

      {/* Navegación Derecha */}
      {selectedIndex < pages.length - 1 && (
        <button
          onClick={onNext}
          className="absolute right-0 z-50 px-4 md:px-8 text-white/30 hover:text-white transition-colors h-full flex items-center hover:bg-linear-to-l hover:from-black/50 hover:to-transparent"
          aria-label="Imagen siguiente"
        >
          <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      )}

      {/* Contenedor Principal */}
      <div className="relative w-full h-full flex items-center justify-center p-4 md:p-12">
        {isLoading && (
          <div className="w-full h-[60vh] md:h-[80vh] max-w-4xl mx-auto rounded-lg bg-white/0.03 border border-white/0.05 animate-pulse flex items-center justify-center shadow-2xl backdrop-blur-sm">
            <div className="w-16 h-16 rounded-full bg-white/0.02 flex items-center justify-center">
              <svg className="w-6 h-6 text-white/10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
          </div>
        )}

        {error && (
          <div className="text-red-500 font-mono flex flex-col items-center gap-4 bg-red-500/10 p-6 neo-border border-red-500/50">
            <span>{error}</span>
            <Button onClick={onClose} variant="danger" size="sm">Cerrar</Button>
          </div>
        )}

        {!isLoading && !error && highResUrl && (
          <img
            src={highResUrl}
            alt={`Página ${selectedIndex + 1}`}
            className="max-w-full max-h-full object-contain shadow-2xl animate-fade-in select-none"
            referrerPolicy="no-referrer"
            draggable={false}
          />
        )}
      </div>
      
      {/* Indicador de Página */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 text-white/50 font-mono text-sm tracking-widest font-black bg-black/50 px-4 py-1 rounded-full">
        {selectedIndex + 1} / {pages.length}
      </div>
    </div>
  );
}