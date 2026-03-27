"use client";

import { useEffect } from "react";
import { useViewerNavigation } from "@/features/image-viewer/hooks/useViewerNavigation";
import { ViewerHeader } from "./components/ViewerHeader";
import { ViewerGrid } from "./components/ViewerGrid";
import { ViewerLightbox } from "./components/ViewerLightbox";
import { ImageViewerModalProps } from "./ImageViewerModal.types";

export function ImageViewerModal({
  title,
  pages,
  isLoading,
  isLoadingMore,
  hasMorePages,
  onLoadMore,
  onClose,
}: ImageViewerModalProps) {
  const { selectedIndex, setSelectedIndex, showNext, showPrev } = useViewerNavigation(pages);

  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "unset";
    };
  }, []);

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-black/95 backdrop-blur-md w-screen h-screen overflow-hidden animate-fade-in">
      <ViewerHeader title={title} onClose={onClose} />

      <div className="flex-1 overflow-y-auto p-4 md:p-8 custom-scrollbar">
        <ViewerGrid
          pages={pages}
          galleryTitle={title}
          isLoading={isLoading}
          isLoadingMore={isLoadingMore}
          hasMorePages={hasMorePages}
          onLoadMore={onLoadMore}
          onSelectImage={setSelectedIndex}
        />
      </div>

      {selectedIndex !== null && (
        <ViewerLightbox
          pages={pages}
          selectedIndex={selectedIndex}
          onClose={() => setSelectedIndex(null)}
          onNext={showNext}
          onPrev={showPrev}
        />
      )}
    </div>
  );
}
