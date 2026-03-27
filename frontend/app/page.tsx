// frontend/app/page.tsx
"use client";

import { useState, useEffect } from "react";
import { useSearch } from "@/features/search/hooks/useSearch";

import FilterBar from "@/features/search/components/FilterBar";
import { GalleryCard } from "@/src/components/GalleryCard";
import { TrendingSection } from "@/features/search/TrendingSection";
import { ImageViewerModal } from "@/features/image-viewer/ImageViewerModal";

import { useSearchStore } from "@/src/store/searchStore";
import { useViewerSync } from "@/features/image-viewer/hooks/useViewerSync";
import { api } from "@/src/services/api";
import { Button } from "@/src/components/ui/Button";

export default function Home() {
  // ... (Toda tu lógica y useEffects se mantienen exactamente igual) ...
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
  const { trending, fetchTrending } = useSearchStore();
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
  useEffect(() => {
    fetchTrending();
  }, [fetchTrending]);

  return (
    <div className="w-full animate-fade-in">
      {/* 🎯 HERO SECTION (Buscador) */}
      <section className="max-w-4xl mx-auto text-center pt-12 pb-8 px-4">
        <h1 className="text-5xl md:text-7xl font-black mb-4 font-mono tracking-tighter uppercase">
          EH<span className="text-(--accent-color)">-</span>Explorer
        </h1>
        <p className="text-(--text-secondary) mb-8 font-medium text-base md:text-lg">
          Extracción y visualización de alto rendimiento
        </p>

        <form
          onSubmit={handleSearch}
          className="flex flex-col md:flex-row gap-4 mb-6 relative z-10 w-full"
        >
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="¿Qué estás buscando? (Ej. Artbook, Cosplay...)"
            className="flex-1 bg-(--bg-secondary) text-(--foreground) neo-border neo-shadow px-6 py-4 focus:outline-none focus:neo-shadow-accent transition-all text-lg font-mono placeholder:text-gray-400 min-h-[56px]"
          />
          <Button
            type="submit"
            isLoading={isLoading}
            size="lg"
            variant="primary"
            className="min-h-[56px] px-8 text-lg"
          >
            {isLoading ? "Buscando..." : "Buscar"}
          </Button>
        </form>

        <FilterBar activeCategories={activeCategories} toggleCategory={toggleCategory} />
      </section>

      {/* ⚠️ ESTADO DE ERROR */}
      {error && (
        <div className="text-center text-(--danger) mb-8 font-mono p-4 bg-red-50 neo-border neo-shadow max-w-md mx-auto">
          {error}
        </div>
      )}

      {/* 📦 CONTENEDOR PRINCIPAL */}
      <section className="max-w-[100rem] mx-auto px-4 md:px-8">
        {/* ESCAPARATE DE TENDENCIAS */}
        {query === "" && (
          <TrendingSection
            trending={trending}
            onOpenVisor={handleOpenVisor}
            onDownloadTotal={handleDownloadTotal}
          />
        )}

        {/* GRID DE RESULTADOS */}
        {results.length > 0 && (
          <div className="mt-8 border-t-[3px] border-(--border-color) pt-8">
            <h3 className="text-xl md:text-2xl font-black font-mono uppercase mb-8 opacity-40 tracking-widest">
              Resultados
            </h3>

            {/* 🟢 Grid fluido y responsivo: 1 col (móvil), 2 (tablet), 4/5 (desktop) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6 md:gap-8">
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

        {/* 🔄 BOTÓN CARGAR MÁS */}
        {results.length > 0 && hasMore && (
          <div className="flex justify-center mt-16 mb-24">
            <Button
              onClick={loadMore}
              isLoading={isLoadingMore}
              variant="secondary"
              size="lg"
              className="w-full max-w-sm h-14 text-lg"
            >
              {isLoadingMore ? "Cargando..." : "Cargar Más Resultados ↓"}
            </Button>
          </div>
        )}
      </section>

      {/* 🎬 MODAL VISOR */}
      {isViewerOpen && (
        <ImageViewerModal
          title={activeTitle}
          pages={viewerPages}
          isLoading={isViewerLoading}
          onClose={closeViewer}
        />
      )}
    </div>
  );
}
