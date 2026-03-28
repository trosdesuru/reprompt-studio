"use client";
import { useState } from "react";
import { usePromptExtractor } from "../hooks/usePromptExtractor";

import { ExtractorDropzone } from "./ExtractorDropzone";
import { ExtractorInspector } from "./ExtractorInspector";

export function ExtractorContainer() {
  const { extractFromFile, isExtracting, error, extractedData, resetExtraction } =
    usePromptExtractor();
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const handleFileDrop = async (file: File) => {
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
    await extractFromFile(file);
  };

  const handleReset = () => {
    resetExtraction();
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl(null);
  };

  return (
    <section className="w-full max-w-6xl mx-auto p-4">
      {!extractedData ? (
        <ExtractorDropzone onFileDrop={handleFileDrop} isExtracting={isExtracting} error={error} />
      ) : (
        <ExtractorInspector
          extractedData={extractedData}
          previewUrl={previewUrl!}
          onReset={handleReset}
        />
      )}
    </section>
  );
}
