"use client";

// 🟢 Ahora lo importamos desde la misma carpeta
import ImageCard from "./ImageCard";
import { useViewerNavigation } from "../hooks/useViewerNavigation";
import { FullImageResolver } from "./FullImageResolver";
import { Button } from "../../../src/components/ui/Button";

interface ImageViewerModalProps {
  title: string;
  pages: string[];
  isLoading: boolean;
  onClose: () => void;
}

export default function ImageViewerModal({
  title,
  pages,
  isLoading,
  onClose,
}: ImageViewerModalProps) {
  const { selectedIndex, setSelectedIndex, showNext, showPrev } = useViewerNavigation(pages);

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-background w-screen h-screen overflow-hidden">
      
      {/* Header Modal */}
      <div className="flex-none flex justify-between items-center p-4 bg-[var(--bg-secondary)] border-b-4 border-(--border-color) z-30">
        <h2 className="text-xl md:text-2xl font-black text-foreground font-mono truncate w-2/3 uppercase tracking-tighter">
          {title}
        </h2>
        <Button onClick={onClose} variant="danger" size="md">
          Cerrar ✖
        </Button>
      </div>

      {/* Grid de Páginas */}
      <div className="flex-1 overflow-y-auto p-4 md:p-8 bg-background custom-scrollbar">
        {isLoading ? (
          <div className="flex items-center justify-center h-64">
            <svg className="animate-spin h-12 w-12 text-[var(--accent-color)]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          </div>
        ) : (
          <div className="relative z-10 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6 max-w-7xl mx-auto w-full pb-20">
            {pages.map((pageUrl, i) => (
              <ImageCard
                key={i}
                pageUrl={pageUrl}
                index={i + 1}
                galleryTitle={title}
                onOpenImage={() => setSelectedIndex(i)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Full Screen Image Viewer */}
      {selectedIndex !== null && (
        <div 
          className="fixed inset-0 z-100 bg-black/95 flex items-center justify-center backdrop-blur-sm"
          onClick={() => setSelectedIndex(null)} 
        >
          <div className="relative w-full h-full flex items-center justify-center p-4 md:p-12">
            
            {selectedIndex > 0 && (
              <button 
                className="absolute left-4 md:left-8 z-120 p-4 bg-[var(--bg-secondary)] neo-border neo-shadow text-foreground hover:neo-shadow-accent transition-all"
                onClick={(e) => { e.stopPropagation(); showPrev(); }}
              >
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
            )}

            <FullImageResolver pageUrl={pages[selectedIndex]} index={selectedIndex + 1} />

            {selectedIndex < pages.length - 1 && (
              <button 
                className="absolute right-4 md:right-8 z-120 p-4 bg-[var(--bg-secondary)] neo-border neo-shadow text-foreground hover:neo-shadow-accent transition-all"
                onClick={(e) => { e.stopPropagation(); showNext(); }}
              >
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            )}

            <button 
              className="absolute top-6 right-6 z-120 text-white bg-red-600 neo-border neo-shadow hover:bg-red-500 w-12 h-12 flex items-center justify-center font-bold text-xl"
              onClick={() => setSelectedIndex(null)}
            >✕</button>
          </div>
        </div>
      )}
    </div>
  );
}