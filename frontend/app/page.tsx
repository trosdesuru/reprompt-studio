"use client";

import { useState } from "react";
import SearchForm from "../features/search/components/SearchForm";
import { useSearch } from "../features/search/hooks/useSearch";
import ImageViewerModal from "../features/image-viewer/components/ImageViewerModal";
import { useViewerSync } from "../features/image-viewer/hooks/useViewerSync";

import GalleryCard from "@/src/components/GalleryCard";
import { api } from "@/src/services/api";

export default function Home() {
  const { query, setQuery, results, isLoading, error, handleSearch } = useSearch();
  const [viewerData, setViewerData] = useState<{ url: string; title: string } | null>(null);

  // 🟢 Nuevo estado para notificaciones de descarga elegantes
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

  const { viewerPages, isViewerLoading, isViewerOpen, closeViewer, openViewer } = useViewerSync(
    viewerData?.url || "",
  );

  // 🟢 Conectamos el botón con la API y damos feedback al usuario
  const handleDownloadTotal = async (url: string, title: string) => {
    try {
      setToast({ message: `📦 Encolando galería: ${title}...`, type: "success" });
      const res = await api.descargarTotal(url, title);

      if (res.status === "success") {
        setToast({
          message: `✅ Descarga iniciada en 2º plano. Revisa los logs del Worker.`,
          type: "success",
        });
      }
    } catch (err) {
      setToast({ message: "❌ Error al conectar con el servicio de descargas", type: "error" });
    } finally {
      // Ocultar la notificación después de 4 segundos
      setTimeout(() => setToast(null), 4000);
    }
  };

  const onOpenGallery = (url: string, title: string) => {
    setViewerData({ url, title });
    openViewer(url);
  };
  return (
    <main className="min-h-screen bg-gray-900 text-white p-8 font-sans antialiased relative">
      <header className="mb-10 text-center">
        <h1 className="text-4xl font-extrabold text-blue-400">Gallery Scraper Pro</h1>
      </header>
      {/* 🟢 Renderizado del Toast System flotante */}
      {toast && (
        <div
          className={`fixed top-5 right-5 z-9999 p-4 rounded-lg shadow-2xl transition-all font-bold border ${
            toast.type === "success"
              ? "bg-green-900/90 border-green-500 text-green-100"
              : "bg-red-900/90 border-red-500 text-red-100"
          }`}
        >
          {toast.message}
        </div>
      )}

      <SearchForm query={query} setQuery={setQuery} onSearch={handleSearch} isLoading={isLoading} />

      {error && (
        <div className="max-w-2xl mx-auto mb-8 p-4 bg-red-900/50 border border-red-500 rounded-lg text-red-200 text-center font-semibold">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6 max-w-7xl mx-auto">
        {results.map((item) => (
          <GalleryCard
            key={item.url}
            item={item}
            onDownloadTotal={handleDownloadTotal}
            onOpenVisor={onOpenGallery}
          />
        ))}
      </div>
      {isViewerOpen && viewerData && (
        <ImageViewerModal
          title={viewerData.title}
          pages={viewerPages}
          isLoading={isViewerLoading}
          onClose={() => {
            setViewerData(null);
            closeViewer();
          }}
        />
      )}
    </main>
  );
}
