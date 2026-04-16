"use client";
import React, { useEffect } from "react";
import { Plus, Search, FolderPlus, UploadCloud } from "lucide-react";
import { useStudio } from "@/store/useStudio";
import { SidebarDirectory } from "@/system/organisms/Studio/SidebarDirectory";
import PromptGrid from "@/system/organisms/Studio/PromptGrid";
import { usePromptExtractor } from "@/store/usePromptExtractor";

export default function StudioPage() {
  const { directories, setDirectories, searchQuery, setSearchQuery, setIsSearching } = useStudio();
  const { processFiles } = usePromptExtractor();

  // Carga inicial de directorios desde el búnker
  useEffect(() => {
    const fetchDirs = async () => {
      try {
        const res = await fetch('/api/directories');
        const data = await res.json();
        setDirectories(data);
      } catch (error) {
        console.error("Error cargando directorios:", error);
      }
    };
    fetchDirs();
  }, [setDirectories]);

  const handleUploadClick = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.multiple = true;
    input.onchange = (e) => {
      const files = (e.target as HTMLInputElement).files;
      if (files) processFiles(Array.from(files));
    };
    input.click();
  };

  return (
    <div className="flex h-[calc(100vh-64px)] bg-background">
      {/* SIDEBAR IZQUIERDO: ORGANIZACIÓN */}
      <aside className="w-72 border-r bg-card/30 backdrop-blur-sm flex flex-col">
        <div className="p-4 border-b space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Mi Studio</h2>
            <div className="flex gap-1">
              <button className="p-1.5 hover:bg-secondary rounded-lg" title="Nueva Carpeta">
                <FolderPlus size={16} />
              </button>
              <button 
                onClick={handleUploadClick}
                className="p-1.5 hover:bg-secondary rounded-lg text-primary" 
                title="Subir Imágenes"
              >
                <UploadCloud size={16} />
              </button>
            </div>
          </div>

          {/* Buscador Vectorial */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={14} />
            <input 
              type="text"
              placeholder="Búsqueda semántica..."
              className="w-full bg-secondary/50 border-none rounded-full py-2 pl-9 pr-4 text-xs focus:ring-1 focus:ring-primary outline-none transition-all"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto py-4">
          {/* Solo renderizamos las carpetas raíz */}
          {directories.filter(d => !d.parent_id).map((dir) => (
            <SidebarDirectory key={dir.id} directory={dir} />
          ))}
          
          {directories.length === 0 && (
            <div className="px-6 py-10 text-center space-y-2">
              <p className="text-xs text-muted-foreground italic">No hay carpetas aún.</p>
            </div>
          )}
        </div>
      </aside>

      {/* ÁREA PRINCIPAL: GALERÍA */}
      <main className="flex-1 overflow-y-auto custom-scrollbar">
        <div className="max-w-7xl mx-auto p-6">
          <PromptGrid />
        </div>
      </main>
    </div>
  );
}