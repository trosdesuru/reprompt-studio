"use client";

import { useState, useEffect, useRef } from "react";
import { api } from "../services/api";

interface ImageCardProps {
  pageUrl: string;
  index: number;
  galleryTitle: string;
  onOpenImage: (imgUrl: string) => void;
}

export default function ImageCard({ pageUrl, index, galleryTitle, onOpenImage }: ImageCardProps) {
  const [imageUrl, setImageUrl] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  const cardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { rootMargin: "300px" },
    );

    if (cardRef.current) observer.observe(cardRef.current);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!isVisible) return;

    const delayMs = (index % 40) * 100;
    const timeoutId = setTimeout(async () => {
      setIsLoading(true);
      try {
        const data = await api.resolverImagen(pageUrl);
        if (data.status === "success" && data.url_img) {
          setImageUrl(data.url_img);
        }
      } catch (e) {
        console.error(`Error loading image ${index}:`, e);
      } finally {
        setIsLoading(false);
      }
    }, delayMs);

    return () => clearTimeout(timeoutId);
  }, [pageUrl, isVisible, index]);

  const handleDownload = async () => {
    if (!imageUrl) return;
    try {
      await api.descargarImagen(imageUrl, galleryTitle, index);
      console.log(`✅ Download request sent: image ${index}`);
    } catch (error) {
      alert(`Error downloading image ${index}`);
    }
  };

  return (
    <div
      ref={cardRef}
      className="bg-gray-800 rounded-lg overflow-hidden border border-gray-700 hover:border-blue-500 flex flex-col shadow-lg relative z-20"
    >
      <div
        className="h-56 relative bg-gray-900 flex items-center justify-center overflow-hidden cursor-pointer group"
        onClick={() => {
          console.log(`🖱️ Clicked card ${index}`);
          if (imageUrl) onOpenImage(imageUrl);
        }}
      >
        {!isVisible ? (
          <span className="text-gray-600 text-sm font-medium pointer-events-none">Waiting...</span>
        ) : isLoading ? (
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 pointer-events-none"></div>
        ) : imageUrl ? (
          <img
            src={imageUrl}
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105 pointer-events-none"
            alt={`Thumbnail ${index}`}
          />
        ) : (
          <span className="text-red-400 text-xs font-bold pointer-events-none">Error</span>
        )}

        <span className="absolute top-2 left-2 bg-black/80 text-xs font-bold px-2 py-1 rounded text-blue-400 pointer-events-none">
          #{index}
        </span>
      </div>
      <button
        onClick={handleDownload}
        disabled={!imageUrl || isLoading}
        className="bg-gray-700 hover:bg-green-600 text-white font-semibold py-2 transition-colors text-sm w-full disabled:opacity-30 disabled:hover:bg-gray-700"
      >
        ⬇️ Save Photo
      </button>
    </div>
  );
}
