"use client";

import ImageCard from "@/src/components/ImageCard";
import { useViewerNavigation } from "../hooks/useViewerNavigation";
import { FullImageResolver } from "./FullImageResolver";

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
    <div className="fixed inset-0 z-50 flex flex-col bg-gray-900 w-screen h-screen overflow-hidden">
      {}
      <div className="flex-none flex justify-between items-center p-4 bg-gray-900 border-b border-gray-800 z-30 shadow-2xl">
        <h2 className="text-xl font-bold text-blue-400 truncate w-2/3">{title}</h2>
        <button
          onClick={onClose}
          className="bg-red-600 hover:bg-red-500 text-white font-bold px-6 py-2 rounded-full transition-all"
        >
          Close ✖
        </button>
      </div>

      {}
      <div className="flex-1 overflow-y-auto p-4 sm:p-8 custom-scrollbar">
        {isLoading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
          </div>
        ) : (
          <div className="relative z-10 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 max-w-7xl mx-auto w-full pb-20">
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

      {}
      {selectedIndex !== null && (
        <div 
          className="fixed inset-0 z-100 bg-black/95 flex items-center justify-center"
          onClick={() => setSelectedIndex(null)} 
        >
          <div className="relative w-full h-full flex items-center justify-center p-4 md:p-12">
            {}
            {selectedIndex > 0 && (
              <button 
                className="absolute left-4 z-120 p-4 bg-gray-800/60 hover:bg-blue-600 text-white rounded-full transition-all"
                onClick={(e) => { e.stopPropagation(); showPrev(); }}
              >
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
            )}

            <FullImageResolver pageUrl={pages[selectedIndex]} index={selectedIndex + 1} />

            {}
            {selectedIndex < pages.length - 1 && (
              <button 
                className="absolute right-4 z-120 p-4 bg-gray-800/60 hover:bg-blue-600 text-white rounded-full transition-all"
                onClick={(e) => { e.stopPropagation(); showNext(); }}
              >
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            )}

            <button 
              className="absolute top-6 right-6 z-120 text-white bg-red-600 hover:bg-red-700 rounded-full w-12 h-12 flex items-center justify-center font-bold text-xl"
              onClick={() => setSelectedIndex(null)}
            >✕</button>
          </div>
        </div>
      )}
    </div>
  );
}