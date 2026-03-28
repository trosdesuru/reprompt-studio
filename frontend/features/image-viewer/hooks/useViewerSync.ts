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
    if (!urlToFetch) return;

    setIsViewerOpen(true);
    setIsViewerLoading(true);
    setViewerPages([]);

    try {
      const res = await api.leer(urlToFetch, 0);
      // 🟢 FIX: Ahora leemos "res.data" para cumplir el contrato
      if (res.status === "success" && Array.isArray(res.data)) {
        setViewerPages(res.data);
        setHasMorePages(res.has_next);
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

  const loadNextPage = useCallback(async () => {
    if (!hasMorePages || isLoadingMore) return;
    setIsLoadingMore(true);
    try {
      const res = await api.leer(activeUrl, currentViewerPage);
      if (res.status === "success" && Array.isArray(res.data)) {
        setViewerPages((prev) => [...prev, ...res.data]);
        setHasMorePages(res.has_next);
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
