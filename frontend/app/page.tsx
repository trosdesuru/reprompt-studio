// frontend/app/page.tsx
"use client";

import { useState, useEffect } from "react";
import { useSearch } from "@/features/search/hooks/useSearch";

import FilterBar from "@/features/search/components/FilterBar";
import { GalleryCard } from "@/src/components/GalleryCard";
import { GalleryItem } from "@/src/types/gallery";
import { TrendingSection } from "@/features/search/TrendingSection";
import { ImageViewerModal } from "@/features/image-viewer/ImageViewerModal";

import { useSearchStore } from "@/src/store/searchStore";
import { useViewerSync } from "@/features/image-viewer/hooks/useViewerSync";
import { api } from "@/src/services/api";
import { Button } from "@/src/components/ui/Button";

export default function Home() {
  const {
    query,
    setQuery,
    results,
    isLoading,
    isLoadingMore: isLoadingMoreResults, // 🟢 Renombramos para evitar colisión
    hasMore,
    error,
    handleSearch,
    loadMore,
    activeCategories,
    toggleCategory,
  } = useSearch();

  const [activeUrl, setActiveUrl] = useState("");
  const [activeTitle, setActiveTitle] = useState("");
  const { trending, fetchTrending } = useSearchStore();

  // 🟢 Desestructuramos de useViewerSync (aquí es donde van hasMorePages y loadNextPage)
  const {
    viewerPages,
    isViewerLoading,
    isLoadingMore: isLoadingMorePages, // 🟢 Renombramos para evitar colisión
    isViewerOpen,
    openViewer,
    closeViewer,
    hasMorePages,
    loadNextPage,
  } = useViewerSync(activeUrl);

  const handleOpenVisor = (item: GalleryItem) => {
    setActiveUrl(item.url);
    setActiveTitle(item.title);
    openViewer(item.url);
    api.registrarInteraccion(item, "view").catch(console.error);
  };

  const handleDownloadTotal = async (item: GalleryItem) => {
    try {
      await api.descargarTotal(item.url, item.title);
      api.registrarInteraccion(item, "download").catch(console.error);
      alert(`⬇️ Descarga iniciada: ${item.title}`);
    } catch (err) {
      alert("❌ Error al encolar la descarga.");
    }
  };

  useEffect(() => {
    fetchTrending();
  }, [fetchTrending]);

  return (
    <main className="min-h-screen bg-background text-foreground font-sans">
      <div className="max-w-6xl mx-auto text-center mb-12 mt-8">
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
            className="flex-1 bg-(--bg-secondary) text-foreground neo-border neo-shadow px-5 py-4 focus:outline-none focus:neo-shadow-accent transition-all text-lg font-mono placeholder:text-gray-500"
          />
          <Button type="submit" isLoading={isLoading} size="lg" variant="primary">
            {isLoading ? "Buscando" : "Buscar"}
          </Button>
        </form>

        <FilterBar activeCategories={activeCategories} toggleCategory={toggleCategory} />
      </div>

      {error && (
        <div className="text-center text-red-500 mb-8 font-mono p-4 bg-red-500/10 neo-border neo-shadow max-w-md mx-auto">
          {error}
        </div>
      )}

      <div className="max-w-360 mx-auto px-4">
        {query === "" && (
          <TrendingSection
            trending={trending}
            onOpenVisor={handleOpenVisor}
            onDownloadTotal={handleDownloadTotal}
          />
        )}

        {results.length > 0 && (
          <div className="mt-8 border-t-2 border-(--border-color) pt-8">
            <h3 className="text-xl font-black font-mono uppercase mb-6 opacity-50">
              Resultados de Búsqueda
            </h3>
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
          </div>
        )}

        {results.length > 0 && hasMore && (
          <div className="flex justify-center mt-16 mb-12">
            <Button
              onClick={loadMore}
              isLoading={isLoadingMoreResults}
              variant="secondary"
              size="lg"
            >
              {isLoadingMoreResults ? "Cargando..." : "↓ Ver más resultados"}
            </Button>
          </div>
        )}

        {isViewerOpen && (
          <ImageViewerModal
            title={activeTitle}
            pages={viewerPages}
            isLoading={isViewerLoading}
            isLoadingMore={isLoadingMorePages}
            hasMorePages={hasMorePages}
            onLoadMore={loadNextPage}
            onClose={closeViewer}
          />
        )}
      </div>
    </main>
  );
}
