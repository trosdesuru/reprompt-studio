"use client";

import { useState } from "react";
import { downloadApi } from "@/src/services/api/downloads";
import { IconDownload, IconLoader2 } from "@tabler/icons-react";

interface DownloadButtonProps {
  collectionId: string;
}

export function DownloadButton({ collectionId }: DownloadButtonProps) {
  const [isDownloading, setIsDownloading] = useState(false);

  const handleDownloadCollection = async () => {
    setIsDownloading(true);
    try {
      const { job_id } = await downloadApi.solicitarZipColeccion(collectionId);

      const pollStatus = async () => {
        const { status, download_url } = await downloadApi.verificarEstado(job_id);

        if (status === "finished") {
          window.location.href = download_url;
          setIsDownloading(false);

        } else if (status === "failed") {
          console.error("❌ Error empaquetando el ZIP en el Worker");
          setIsDownloading(false);

        } else {
          setTimeout(pollStatus, 2500);
        }
      };
      pollStatus();
      
    } catch (error) {
      console.error("❌ Fallo al iniciar la descarga:", error);
      setIsDownloading(false);
    }
  };

  return (
    <button
      onClick={handleDownloadCollection}
      disabled={isDownloading}
      className="bg-(--accent-color) text-white px-4 py-2 rounded-md font-mono text-xs md:text-sm font-bold uppercase tracking-widest hover:bg-opacity-90 transition-colors flex items-center gap-2 disabled:opacity-80 disabled:cursor-not-allowed neo-border neo-shadow-accent"
    >
      {isDownloading ? (
        <>
          <IconLoader2 size={18} className="animate-spin" /> Preparando ZIP...
        </>
      ) : (
        <>
          <IconDownload size={18} /> Descargar Colección
        </>
      )}
    </button>
  );
}
