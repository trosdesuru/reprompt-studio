"use client";

import { useState } from "react";
import { usePromptExtractor } from "../hooks/usePromptExtractor";
import { ExtractorDropzone } from "./ExtractorDropzone";
import { ExtractorInspector } from "./ExtractorInspector";

export function ExtractorContainer() {
  const { extractFromFile, isExtracting, error, extractedData, resetExtraction } =
    usePromptExtractor();
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const handleInitialDrop = async (file: File) => {
    // Solo creamos preview si el archivo inicial es una imagen
    if (file.type.startsWith("image/")) {
      setPreviewUrl(URL.createObjectURL(file));
    }
    await extractFromFile(file);
  };

  // 🟢 NUEVO: Función para cuando el usuario sube la imagen a posteriori
  const handleReferenceImageDrop = (file: File) => {
    if (file.type.startsWith("image/")) {
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleReset = () => {
    resetExtraction();
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl(null);
  };

  return (
    <section className="w-full max-w-6xl mx-auto p-4">
      {!extractedData ? (
        <ExtractorDropzone
          onFileDrop={handleInitialDrop}
          isExtracting={isExtracting}
          error={error}
        />
      ) : (
        <ExtractorInspector
          extractedData={extractedData}
          previewUrl={previewUrl} // Ahora puede ser null
          onReset={handleReset}
          onImageReferenceDrop={handleReferenceImageDrop} // Le pasamos el poder de añadir imagen
        />
      )}
    </section>
  );
}
