// frontend/app/page.tsx
"use client";

import { useSearch } from "../features/search/hooks/useSearch";
import FilterBar from "../features/search/components/FilterBar";
import GalleryCard from "../src/components/GalleryCard";
import ImageViewerModal from "../features/image-viewer/components/ImageViewerModal";
import { useViewerSync } from "../features/image-viewer/hooks/useViewerSync";
import { useState } from "react";
import { api } from "../src/services/api";

// 🟢 Importamos nuestro nuevo componente global
import { Button } from "../src/components/ui/Button";

export default function Home() {
  const {
    query,
    setQuery,
    results,
    isLoading,
    isLoadingMore,
    hasMore,
    error,
    handleSearch,
    loadMore,
    activeCategories,
    toggleCategory,
  } = useSearch();

  const [activeUrl, setActiveUrl] = useState("");
  const [activeTitle, setActiveTitle] = useState("");

  const { viewerPages, isViewerLoading, isViewerOpen, openViewer, closeViewer } =
    useViewerSync(activeUrl);

  const handleOpenVisor = (url: string, title: string) => {
    setActiveUrl(url);
    setActiveTitle(title);
    openViewer(url);
  };

  const handleDownloadTotal = async (url: string, title: string) => {
    try {
      await api.descargarTotal(url, title);
      alert(`⬇️ Descarga iniciada: ${title}`);
    } catch (err) {
      alert("❌ Error al encolar la descarga.");
    }
  };

  return (
    // 🟢 Aplicamos las variables globales de color para el fondo
    <main className="min-h-screen bg-background text-foreground font-sans">
      <div className="max-w-6xl mx-auto text-center mb-12 mt-8">
        {/* Título estilo devtools: fuente monoespaciada y color de acento */}
        <h1 className="text-5xl md:text-7xl font-black mb-4 font-mono tracking-tighter text-foreground uppercase">
          EH<span className="text-(--accent-color)">-</span>Explorer
        </h1>
        <p className="text-(--text-secondary) mb-10 font-medium text-lg border-b-2 border-(--border-color) pb-6 inline-block">
          Plataforma de extracción y visor de alto rendimiento
        </p>

        <form
          onSubmit={handleSearch}
          className="flex flex-col md:flex-row gap-4 max-w-3xl mx-auto mb-8 relative z-10"
        >
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Ej: Naruto, Artbook, Cosplay..."
            // 🟢 Input Neo-Brutalista: bordes duros y sombra que cambia al hacer focus
            className="flex-1 bg-(--bg-secondary) text-foreground neo-border neo-shadow px-5 py-4 focus:outline-none focus:neo-shadow-accent transition-all text-lg font-mono placeholder:text-gray-500"
          />
          {/* 🟢 Usamos nuestro componente Button global */}
          <Button type="submit" isLoading={isLoading} size="lg" variant="primary">
            {isLoading ? "Buscando" : "Buscar"}
          </Button>
        </form>

        <FilterBar activeCategories={activeCategories} toggleCategory={toggleCategory} />
      </div>

      {/* Mensaje de Error */}
      {error && (
        <div className="text-center text-red-500 mb-8 font-mono p-4 bg-red-500/10 neo-border neo-shadow max-w-md mx-auto">
          {error}
        </div>
      )}

      {/* Grid de Resultados */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-8">
        {results.map((item, index) => (
          <GalleryCard
            key={`${item.url}-${index}`}
            item={item}
            onOpenVisor={handleOpenVisor}
            onDownloadTotal={handleDownloadTotal}
          />
        ))}
      </div>

      {/* Botón Cargar Más */}
      {results.length > 0 && hasMore && (
        <div className="flex justify-center mt-16 mb-12">
          <Button onClick={loadMore} isLoading={isLoadingMore} variant="secondary" size="lg">
            {isLoadingMore ? "Cargando..." : "↓ Ver más resultados"}
          </Button>
        </div>
      )}

      {/* Modal Visor */}
      {isViewerOpen && (
        <ImageViewerModal
          title={activeTitle}
          pages={viewerPages}
          isLoading={isViewerLoading}
          onClose={closeViewer}
        />
      )}
    </main>
  );
}
