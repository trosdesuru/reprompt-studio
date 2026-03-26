"use client";

import { useState } from "react";
import { useSearch } from "../features/search/hooks/useSearch";
import SearchForm from "../features/search/components/SearchForm";
import GalleryCard from "@/src/components/GalleryCard";
import ImageViewerModal from "../features/image-viewer/components/ImageViewerModal";
import { useViewerSync } from "@/features/image-viewer/hooks/useViewerSync";

export default function Home() {
  const { query, setQuery, results, isLoading, handleSearch } = useSearch();
  const [viewerData, setViewerData] = useState<{
    url: string;
    title: string;
  } | null>(null);

  const {
    viewerPages,
    isViewerLoading,
    isViewerOpen,
    closeViewer,
    openViewer,
  } = useViewerSync(viewerData?.url || "");

  const handleDownloadTotal = async (_url: string, title: string) => {
    console.log("Downloading...", title);
  };

  const onOpenGallery = (url: string, title: string) => {
    setViewerData({ url, title });

    setTimeout(() => openViewer(), 0);
  };

  return (
    <main className="min-h-screen bg-gray-900 text-white p-8 font-sans antialiased">
      <header className="mb-10 text-center">
        <h1 className="text-4xl font-extrabold text-blue-400">
          Gallery Scraper Pro
        </h1>
      </header>

      <SearchForm
        query={query}
        setQuery={setQuery}
        onSearch={handleSearch}
        isLoading={isLoading}
      />

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
