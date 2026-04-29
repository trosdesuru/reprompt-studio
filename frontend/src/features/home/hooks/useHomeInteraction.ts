import { useCallback } from "react";
import { api } from "@/src/services/api";
import { useNotificationStore } from "@/src/store/notificationStore";
import { GalleryItem } from "@/src/types/models";

export function useHomeInteraction() {
  const { notify } = useNotificationStore();

  const handleOpenVisor = useCallback((item: GalleryItem) => {
    api
      .registerInteraction(item, "view")
      .catch((err) => console.error("Fallo al registrar vista:", err));
  }, []);

  const handleDownloadTotal = useCallback(
    async (item: GalleryItem) => {
      try {
        notify("Descarga", `⬇️ Preparando ${item.title}...`, "info");
        await api.solicitarZipColeccion(item.url);
        api.registerInteraction(item, "download").catch(console.error);
        notify("Éxito", `✅ Descarga en cola: ${item.title}`, "success");
      } catch (err) {
        notify("Error", "❌ Fallo en la descarga.", "error");
      }
    },
    [notify],
  );

  return {
    handleOpenVisor,
    handleDownloadTotal,
  };
}
