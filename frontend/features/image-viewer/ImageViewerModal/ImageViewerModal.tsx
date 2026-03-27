"use client";

import { useViewerNavigation } from "../hooks/useViewerNavigation";
import { ViewerHeader } from "./components/ViewerHeader";
import { ViewerGrid } from "./components/ViewerGrid";
import { ViewerLightbox } from "./components/ViewerLightbox";
import { ImageViewerModalProps } from "./ImageViewerModal.types";

export function ImageViewerModal({ title, pages, isLoading, onClose }: ImageViewerModalProps) {
  const { selectedIndex, setSelectedIndex, showNext, showPrev } = useViewerNavigation(pages);

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-background w-screen h-screen overflow-hidden">
      <ViewerHeader title={title} onClose={onClose} />
      <div className="flex-1 overflow-y-auto p-4 md:p-8 bg-background custom-scrollbar">
        <ViewerGrid
          pages={pages}
          galleryTitle={title}
          isLoading={isLoading}
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
