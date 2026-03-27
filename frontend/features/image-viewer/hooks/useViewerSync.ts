import { useState, useEffect } from "react";
import { api } from "@/src/services/api";
import { ViewerPageItem } from "@/src/types/gallery";

export function useViewerSync(activeUrl: string) {
  const [isViewerOpen, setIsViewerOpen] = useState(false);
  const [viewerPages, setViewerPages] = useState<ViewerPageItem[]>([]);
  const [isViewerLoading, setIsViewerLoading] = useState(false);
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

  useEffect(() => {
    if (!isViewerOpen || !hasMorePages) return;

    let isMounted = true;
    const loadNextPage = async () => {
      try {
        const data = await api.leer(activeUrl, currentViewerPage);
        if (isMounted && data.status === "success") {
          setViewerPages((prev) => [...prev, ...data.paginas]);
          setHasMorePages(data.has_next);
          if (data.has_next) setCurrentViewerPage((prev) => prev + 1);
        }
      } catch (e) {
        console.error("Error loading extra page", e);
      }
    };

    loadNextPage();
    return () => {
      isMounted = false;
    };
  }, [isViewerOpen, hasMorePages, currentViewerPage, activeUrl]);

  return { viewerPages, isViewerLoading, isViewerOpen, openViewer, closeViewer };
}
