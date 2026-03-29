"use client";

import { useState } from "react";
import { usePromptExtractor } from "@/features/extractor/hooks/usePromptExtractor";
import { ExtractorDropzone } from "@/features/extractor/components/dropzone"; // Importa el index.tsx de la carpeta
import { ExtractorInspector } from "@/features/extractor/components/inspector";

export default function RepromptPage() {
  // 1. Usamos nuestro Hook estrella
  const { extractFromFile, isExtracting, error, extractedData, resetExtraction } =
    usePromptExtractor();

  // 2. Estado local para la previsualización de la imagen
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const handleFileDrop = async (file: File) => {
    // Si es imagen, creamos la URL para el inspector
    if (file.type.startsWith("image/")) {
      setPreviewUrl(URL.createObjectURL(file));
    }
    await extractFromFile(file);
  };


  const handleReset = () => {
    resetExtraction();
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl(null);
  };

  return (
    <main className="min-h-screen bg-background p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-12">
        {/* Cabecera Estilo Búnker */}
        <section className="text-center space-y-6 pt-10 pb-6">
          <h1 className="text-5xl md:text-7xl font-black uppercase font-mono tracking-tighter text-foreground">
            Estudio <span className="text-(--accent-color)">REPROMPT</span>
          </h1>
          <p className="text-xl md:text-2xl text-(--text-secondary) font-mono max-w-3xl mx-auto leading-relaxed">
            Extrae, analiza y organiza los metadatos de tus generaciones IA.
          </p>
        </section>

        {/* Lógica de Intercambio de Componentes */}
        <section className="w-full max-w-6xl mx-auto">
          {!extractedData ? (
            <ExtractorDropzone
              onFileDrop={handleFileDrop}
              isExtracting={isExtracting}
              error={error}
            />
          ) : (
            <ExtractorInspector
              data={extractedData}
              previewUrl={previewUrl}
              onReset={handleReset}
            />
          )}
        </section>
      </div>
    </main>
  );
}
