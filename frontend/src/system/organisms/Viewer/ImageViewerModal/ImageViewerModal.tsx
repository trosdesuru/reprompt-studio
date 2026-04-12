"use client";

import { useEffect, useRef, useCallback } from "react";
import { IconX, IconLoader2 } from "@tabler/icons-react";
import { UniversalMediaCard } from "@/src/system/organisms/Media/UniversalMediaCard";
import { mapViewerToMediaCard } from "@/src/utils/adapters/mediaAdapters";
import { PageLoader } from "@/src/system/atoms/PageLoader";

interface ViewerPage {
  image_url: string;
  name: string;
  prompt?: string;
}

interface ImageViewerModalProps {
  title: string;
  pages: ViewerPage[];
  isLoading: boolean;
  isLoadingMore: boolean;
  hasMorePages: boolean;
  onLoadMore: () => void;
  onClose: () => void;
}

export function ImageViewerModal({
  title,
  pages,
  isLoading,
  isLoadingMore,
  hasMorePages,
  onLoadMore,
  onClose,
}: ImageViewerModalProps) {
  const observerRef = useRef<IntersectionObserver | null>(null);

  const lastElementRef = useCallback(
    (node: HTMLDivElement | null) => {
      if (isLoading || isLoadingMore) return;
      if (observerRef.current) observerRef.current.disconnect();

      observerRef.current = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting && hasMorePages) onLoadMore();
      });

      if (node) observerRef.current.observe(node);
    },
    [isLoading, isLoadingMore, hasMorePages, onLoadMore],
  );

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleEsc);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", handleEsc);
      document.body.style.overflow = "unset";
    };
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-100 flex flex-col bg-background/95 backdrop-blur-xl animate-in fade-in duration-200">
      <div className="flex-none h-16 px-4 md:px-8 flex items-center justify-between border-b border-border/50 bg-background/50">
        <h2 className="text-lg md:text-xl font-bold line-clamp-1">{title}</h2>
        <button
          onClick={onClose}
          className="p-2 rounded-full hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
        >
          <IconX size={24} />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar p-4 md:p-8">
        {isLoading && pages.length === 0 ? (
          <div className="w-full h-full flex flex-col items-center justify-center gap-4 text-muted-foreground">
            <PageLoader text="Cargando Imagen ..."/>
          </div>
        ) : (
          <div className="max-w-7xl mx-auto space-y-12">
            {pages.map((page, index) => (
              <div
                key={`${index}-${page.image_url}`}
                ref={index === pages.length - 1 ? lastElementRef : null}
                className="w-full flex justify-center"
              >
                <div className="w-full max-w-4xl">
                  <UniversalMediaCard data={mapViewerToMediaCard(page, index)} variant="viewer" />
                </div>
              </div>
            ))}
            {isLoadingMore && (
              <div className="py-8 flex justify-center">
                <IconLoader2 size={32} className="animate-spin text-muted-foreground" />
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
