"use client";

import React, { useState, useEffect } from "react";
import { api } from "@/src/services/api";
import ImageViewerModal from "../src/components/ImageViewerModal";

export default function Home() {
  // --- STATES (En inglés profesional) ---
  const [query, setQuery] = useState<string>("");
  const [pagesToSearch, setPagesToSearch] = useState<number>(1);
  const [results, setResults] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // --- VIEWER STATES ---
  const [isViewerOpen, setIsViewerOpen] = useState<boolean>(false);
  const [viewerPages, setViewerPages] = useState<string[]>([]);
  const [viewerTitle, setViewerTitle] = useState<string>("");
  const [isViewerLoading, setIsViewerLoading] = useState<boolean>(false);

  // --- BACKGROUND LOADING STATES ---
  const [activeGalleryUrl, setActiveGalleryUrl] = useState<string>("");
  const [currentViewerPage, setCurrentViewerPage] = useState<number>(0);
  const [hasMorePages, setHasMorePages] = useState<boolean>(false);

  // --- HANDLERS ---
  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query) return;
    setIsLoading(true);
    try {
      const data = await api.buscar(query, pagesToSearch);
      if (data.status === "success") setResults(data.data);
    } catch (err) {
      console.error("API Connection Error");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownloadTotal = async (url: string, title: string) => {
    alert(`⏳ Starting full gallery download:\n${title}`);
    try {
      await api.descargarTotal(url, title);
    } catch (err) {
      alert("Error connecting to backend");
    }
  };

  const handleOpenViewer = async (url: string, title: string) => {
    setIsViewerOpen(true);
    setIsViewerLoading(true);
    setViewerPages([]);
    setViewerTitle(title);
    setActiveGalleryUrl(url);

    try {
      // Pedimos SOLO la página 0 inicialmente para rapidez total
      const data = await api.leer(url, 0);
      if (data.status === "success") {
        setViewerPages(data.paginas);
        setHasMorePages(data.has_next);
        setCurrentViewerPage(1);
      }
    } catch (err) {
      alert("Error loading gallery pages");
    } finally {
      setIsViewerLoading(false);
    }
  };

  // --- BACKGROUND SILENT LOAD MOTOR ---
  useEffect(() => {
    if (!isViewerOpen || !hasMorePages) return;

    let isMounted = true;
    const loadNextPage = async () => {
      try {
        const data = await api.leer(activeGalleryUrl, currentViewerPage);
        if (isMounted && data.status === "success") {
          setViewerPages((prev) => [...prev, ...data.paginas]);
          setHasMorePages(data.has_next);
          if (data.has_next) {
            setCurrentViewerPage((prev) => prev + 1);
          }
        }
      } catch (e) {
        console.error("Error loading extra page", e);
      }
    };

    loadNextPage();
    return () => {
      isMounted = false;
    };
  }, [isViewerOpen, hasMorePages, currentViewerPage, activeGalleryUrl]);

  useEffect(() => {
    if (isViewerOpen) {
      // 1. Bloqueamos el scroll del body por completo
      document.body.style.overflow = "hidden";
      // 2. Opcional: Evitamos el pequeño salto lateral al desaparecer la barra
      document.body.style.paddingRight = "15px";
    } else {
      // 3. Restauramos al cerrar
      document.body.style.overflow = "unset";
      document.body.style.paddingRight = "0px";
    }

    // Limpieza por si el componente se desmonta inesperadamente
    return () => {
      document.body.style.overflow = "unset";
      document.body.style.paddingRight = "0px";
    };
  }, [isViewerOpen]);

  return (
    <main className="min-h-screen bg-gray-900 text-white p-8 font-sans">
      <h1 className="text-4xl font-extrabold text-blue-400 text-center mb-10">
        Gallery Scraper Pro
      </h1>

      <form
        onSubmit={handleSearch}
        className="max-w-2xl mx-auto flex gap-2 mb-12 bg-gray-800 p-2 rounded-xl border border-gray-700 shadow-xl"
      >
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="flex-1 p-3 rounded bg-gray-900 border border-gray-700 outline-none focus:border-blue-500"
          placeholder="Search character or tag..."
        />
        <button
          type="submit"
          className="bg-blue-600 px-8 py-3 rounded font-bold hover:bg-blue-500 transition-colors"
        >
          SEARCH
        </button>
      </form>

      {/* RESULTS GRID */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
        {results.map((item: any, index: number) => (
          <div
            key={index}
            className="bg-gray-800 rounded-xl overflow-hidden border border-gray-700 flex flex-col shadow-lg"
          >
            <div className="h-64 bg-gray-900 overflow-hidden">
              <img
                src={item.thumb}
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover"
                alt="thumb"
              />
            </div>
            <div className="p-4 flex flex-col gap-2">
              <h2 className="text-sm font-bold line-clamp-2 h-10 text-gray-200">
                {item.title}
              </h2>
              <button
                onClick={() => handleDownloadTotal(item.url, item.title)}
                className="w-full bg-green-600 py-2 rounded text-xs font-bold hover:bg-green-500 transition-colors"
              >
                ⬇️ DOWNLOAD ALL
              </button>
              <button
                onClick={() => handleOpenViewer(item.url, item.title)}
                className="w-full bg-blue-600 py-2 rounded text-xs font-bold hover:bg-blue-500 transition-colors"
              >
                📖 OPEN VIEWER
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* RENDERIZADO DEL MODAL PROFESIONAL */}
      {isViewerOpen && (
        <ImageViewerModal
          title={viewerTitle}
          pages={viewerPages}
          isLoading={isViewerLoading}
          onClose={() => setIsViewerOpen(false)}
        />
      )}
    </main>
  );
}
