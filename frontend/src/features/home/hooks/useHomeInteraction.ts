import { useState, useCallback } from "react";
import { api } from "@/src/services/api";
import { useNotificationStore } from "@/src/store/notificationStore";
import { useViewerSync } from "@/src/features/image-viewer/hooks/useViewerSync";
import { GalleryItem } from "@/src/types/gallery";

export function useHomeInteraction() {
  const { notify } = useNotificationStore();
  const [activeUrl, setActiveUrl] = useState("");
  const [activeTitle, setActiveTitle] = useState("");

  const viewerSync = useViewerSync(activeUrl);

  const handleOpenVisor = useCallback((item: GalleryItem) => {
    setActiveUrl(item.url);
    setActiveTitle(item.title);
    viewerSync.openViewer(item.url);
    
    // Disparamos la métrica en background sin esperar (Fire and Forget)
    api.registerInteraction(item, "view").catch((err) => 
      console.error("Fallo al registrar vista:", err)
    );
  }, [viewerSync]);

  const handleDownloadTotal = useCallback(async (item: GalleryItem) => {
    try {
      notify("Descarga", `⬇️ Preparando ${item.title}...`, "info");
      await api.downloadAll(item.url, item.title);
      api.registerInteraction(item, "download").catch(console.error);
      notify("Éxito", `✅ Descarga encolada: ${item.title}`, "success");
    } catch (err) {
      notify("Error", "❌ Falla crítica al encolar la descarga.", "error");
    }
  }, [notify]);

  return {
    activeTitle,
    viewerSync,
    handleOpenVisor,
    handleDownloadTotal,
  };
}
