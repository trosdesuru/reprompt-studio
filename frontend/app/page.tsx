"use client";

import { useSearch } from "../features/search/hooks/useSearch";
import FilterBar from "../features/search/components/FilterBar";
import GalleryCard from "../src/components/GalleryCard";
// 🟢 Corregimos la importación del Modal (antes decía ImageCard)
import ImageViewerModal from "../src/components/ImageViewerModal";
// 🟢 Importamos el hook que faltaba
import { useGalleryViewer } from "../src/hooks/useGalleryViewer";

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

  const { selectedGallery, isModalOpen, onOpenGallery, onCloseGallery } = useGalleryViewer();

  // 🟢 Función dummy para cumplir con el contrato de GalleryCard
  const handleDownloadTotal = (url: string) => {
    console.log("Descarga total iniciada para:", url);
  };

  return (
    <main className="min-h-screen bg-[#0a0a0a] text-gray-100 p-4 md:p-8">
      {/* Header & Buscador */}
      <div className="max-w-6xl mx-auto text-center mb-10">
        {/* Actualizado a la sugerencia de Tailwind: bg-linear-to-r */}
        <h1 className="text-5xl font-black mb-4 bg-linear-to-r from-blue-500 to-purple-500 bg-clip-text text-transparent">
          EH-EXPLORER
        </h1>
        <p className="text-gray-400 mb-8">Navega y descarga galerías con filtros avanzados</p>

        <form onSubmit={handleSearch} className="flex gap-2 max-w-2xl mx-auto mb-6">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Ej: Naruto, Artbook, Cosplay..."
            className="flex-1 bg-gray-900 border border-gray-700 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
          />
          <button
            type="submit"
            disabled={isLoading}
            className="bg-blue-600 hover:bg-blue-700 px-8 py-3 rounded-lg font-bold transition-colors disabled:opacity-50"
          >
            {isLoading ? "BUSCANDO..." : "BUSCAR"}
          </button>
        </form>

        <FilterBar activeCategories={activeCategories} toggleCategory={toggleCategory} />
      </div>

      {/* Grid de Resultados */}
      {error && <div className="text-center text-red-400 mb-8 font-mono">{error}</div>}

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
        {results.map((item, index) => (
          <GalleryCard
            key={`${item.url}-${index}`}
            item={item}
            onOpenVisor={onOpenGallery}
            onDownloadTotal={handleDownloadTotal} // 🟢 Propiedad añadida
          />
        ))}
      </div>

      {/* Botón Cargar Más */}
      {results.length > 0 && hasMore && (
        <div className="flex justify-center mt-12 mb-8">
          <button
            onClick={loadMore}
            disabled={isLoadingMore}
            className="bg-gray-800 hover:bg-gray-700 text-blue-400 border border-blue-500/30 px-10 py-4 rounded-full font-bold text-lg shadow-xl transition-all disabled:opacity-50"
          >
            {isLoadingMore ? "CARGANDO..." : "⬇️ VER MÁS RESULTADOS"}
          </button>
        </div>
      )}

      {/* 🟢 Cambiado ImageCard por ImageViewerModal */}
      <ImageViewerModal
        isOpen={isModalOpen}
        onClose={onCloseGallery}
        galleryUrl={selectedGallery?.url || ""}
        title={selectedGallery?.title || ""}
      />
    </main>
  );
}
