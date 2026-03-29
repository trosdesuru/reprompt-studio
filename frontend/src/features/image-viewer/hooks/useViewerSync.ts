// frontend/features/image-viewer/hooks/useViewerSync.ts
import { useState, useCallback } from "react";
import { api } from "@/src/services/api";
import { ViewerPageItem } from "@/src/types/gallery";

export function useViewerSync(activeUrl: string) {
  const [isViewerOpen, setIsViewerOpen] = useState(false);
  const [viewerPages, setViewerPages] = useState<ViewerPageItem[]>([]);
  const [isViewerLoading, setIsViewerLoading] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [hasMorePages, setHasMorePages] = useState(false);
  const [currentViewerPage, setCurrentViewerPage] = useState(0);

  const openViewer = async (targetUrl?: string) => {
    const urlToFetch = targetUrl || activeUrl;

    console.log("🧠 [QA DEBUG - CAPA 2] Iniciando openViewer()");
    console.log("🔗 URL solicitada al Backend:", urlToFetch);

    if (!urlToFetch) {
      console.warn("⚠️ [QA DEBUG] openViewer abortado: targetUrl es undefined");
      return;
    }

    setIsViewerOpen(true);
    setIsViewerLoading(true);
    setViewerPages([]);

    try {
      // 🟢 Disparamos la petición al Backend
      const res = await api.leer(urlToFetch, 0);

      console.log("📥 [QA DEBUG - CAPA 2] RESPUESTA BRUTA DEL BACKEND:", res);

      // 🛡️ PROGRAMACIÓN DEFENSIVA: Extraemos el array venga como venga (data, paginas o enlaces)
      const dataArray = res.data || res.paginas || res.enlaces;

      console.log("🔍 [QA DEBUG - CAPA 2] Array de imágenes detectado:", dataArray);

      if (res.status === "success" || res.status === "ok" || (dataArray && dataArray.length > 0)) {
        if (Array.isArray(dataArray) && dataArray.length > 0) {
          console.log(`✅ [QA DEBUG] Guardando ${dataArray.length} imágenes en el estado.`);
          setViewerPages(dataArray);
          setHasMorePages(!!res.has_next);
          setCurrentViewerPage(1);
        } else {
          console.warn(
            "⚠️ [QA DEBUG] El Backend devolvió SUCCESS, pero el array de imágenes está VACÍO o no es un array válido.",
          );
          setViewerPages([]);
        }
      } else {
        console.error(
          "❌ [QA DEBUG] El Backend devolvió un status de ERROR o estructura irreconocible:",
          res,
        );
        setViewerPages([]);
      }
    } catch (err) {
      console.error("💥 [QA DEBUG - CAPA 2] Crash durante la petición de red:", err);
    } finally {
      setIsViewerLoading(false);
    }
  };

  const closeViewer = () => {
    setIsViewerOpen(false);
    setViewerPages([]);
  };

  const loadNextPage = useCallback(async () => {
    // Para simplificar la prueba actual, dejamos el loadNextPage con su lógica básica
    if (!hasMorePages || isLoadingMore) return;
    setIsLoadingMore(true);
    try {
      const res = await api.leer(activeUrl, currentViewerPage);
      const dataArray = res.data || res.paginas || res.enlaces;
      if (Array.isArray(dataArray)) {
        setViewerPages((prev) => [...prev, ...dataArray]);
        setHasMorePages(!!res.has_next);
        if (res.has_next) setCurrentViewerPage((prev) => prev + 1);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoadingMore(false);
    }
  }, [activeUrl, currentViewerPage, hasMorePages, isLoadingMore]);

  return {
    viewerPages,
    isViewerLoading,
    isLoadingMore,
    isViewerOpen,
    openViewer,
    closeViewer,
    hasMorePages,
    loadNextPage,
  };
}
