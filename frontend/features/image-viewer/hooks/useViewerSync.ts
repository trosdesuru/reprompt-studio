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
    if (!urlToFetch) return;

    setIsViewerOpen(true);
    setIsViewerLoading(true);
    setViewerPages([]);

    try {
      const data = await api.leer(urlToFetch, 0);
      if (data.status === "success") {
        setViewerPages(data.paginas);
        setHasMorePages(data.has_next);
        setCurrentViewerPage(1);
      }
    } catch (err) {
      console.error("Error loading gallery initial page", err);
    } finally {
      setIsViewerLoading(false);
    }
  };

  const closeViewer = () => {
    setIsViewerOpen(false);
    setViewerPages([]);
  };

  // 🟢 Paginación manual y controlada (¡Adiós bucle infinito!)
  const loadNextPage = useCallback(async () => {
    if (!hasMorePages || isLoadingMore) return;
    setIsLoadingMore(true);
    try {
      const data = await api.leer(activeUrl, currentViewerPage);
      if (data.status === "success") {
        setViewerPages((prev) => [...prev, ...data.paginas]);
        setHasMorePages(data.has_next);
        if (data.has_next) setCurrentViewerPage((prev) => prev + 1);
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
