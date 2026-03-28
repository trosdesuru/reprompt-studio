// frontend/src/components/features/extractor/PromptExtractor.tsx
"use client";

import { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { usePromptExtractor } from "@/src/components/hooks/usePromptExtractor";
import { IconUpload, IconCopy, IconCheck, IconTrash, IconWand } from "@tabler/icons-react";
import { Button } from "@/src/components/ui/Button";

export function PromptExtractor() {
  const { extractFromFile, isExtracting, error, extractedData, resetExtraction } =
    usePromptExtractor();
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  // FASE 4: Configuración del Drag & Drop
  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      const file = acceptedFiles[0];
      if (file) {
        // 1. Creamos una URL temporal local para previsualizar la imagen (coste 0$)
        setPreviewUrl(URL.createObjectURL(file));
        // 2. Disparamos nuestro cerebro extractor
        await extractFromFile(file);
      }
    },
    [extractFromFile],
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "image/png": [".png"] },
    maxFiles: 1,
  });

  const handleReset = () => {
    resetExtraction();
    if (previewUrl) URL.revokeObjectURL(previewUrl); // Limpiamos la RAM
    setPreviewUrl(null);
  };

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  return (
    <div className="w-full max-w-6xl mx-auto p-4">
      {/* SI NO HAY DATOS: Mostramos la Zona de Aterrizaje */}
      {!extractedData && !isExtracting && (
        <div
          {...getRootProps()}
          className={`border-4 border-dashed transition-all duration-300 ease-in-out flex flex-col items-center justify-center min-h-[400px] cursor-pointer neo-border bg-(--bg-secondary) ${
            isDragActive
              ? "border-(--accent-color) bg-(--accent-color)/10 scale-[1.02]"
              : "border-(--border-color) hover:border-(--text-secondary)"
          }`}
        >
          <input {...getInputProps()} />
          <div className="p-6 bg-background rounded-full neo-border mb-4">
            <IconUpload
              size={48}
              className={isDragActive ? "text-(--accent-color) animate-bounce" : "text-foreground"}
            />
          </div>
          <h2 className="text-2xl font-black font-mono uppercase mb-2">
            {isDragActive ? "¡Suelta el PNG aquí!" : "Arrastra tu generación IA"}
          </h2>
          <p className="text-(--text-secondary) font-mono text-sm max-w-md text-center">
            Soporta PNGs de Stable Diffusion, Automatic1111, ComfyUI y NovelAI. Todo se procesa
            localmente en tu navegador.
          </p>

          {error && (
            <div className="mt-6 bg-red-500/10 text-red-500 font-bold p-3 neo-border text-sm">
              ❌ {error}
            </div>
          )}
        </div>
      )}

      {/* ESTADO DE CARGA */}
      {isExtracting && (
        <div className="flex flex-col items-center justify-center min-h-[400px] animate-pulse">
          <IconWand size={64} className="text-(--accent-color) animate-spin" />
          <h2 className="text-xl font-black font-mono uppercase mt-4">Extrayendo Magia...</h2>
        </div>
      )}

      {/* FASE 5: EL INSPECTOR (Vista dividida) */}
      {extractedData && previewUrl && (
        <div className="flex flex-col md:flex-row gap-6 animate-fade-in">
          {/* Columna Izquierda: Imagen */}
          <div className="w-full md:w-1/3 flex flex-col gap-4">
            <div className="neo-border neo-shadow bg-(--bg-secondary) p-2">
              <img
                src={previewUrl}
                alt="Preview"
                className="w-full h-auto object-contain border-2 border-(--border-color)"
              />
            </div>
            <Button
              variant="danger"
              onClick={handleReset}
              className="w-full flex items-center justify-center gap-2"
            >
              <IconTrash size={18} /> Limpiar y subir otra
            </Button>
          </div>

          {/* Columna Derecha: Datos Extraídos */}
          <div className="w-full md:w-2/3 flex flex-col gap-4">
            {/* Píldoras Técnicas */}
            <div className="flex flex-wrap gap-2">
              {extractedData.model && <Badge label="Model" value={extractedData.model} />}
              {extractedData.sampler && <Badge label="Sampler" value={extractedData.sampler} />}
              {extractedData.steps && <Badge label="Steps" value={extractedData.steps} />}
              {extractedData.cfgScale && <Badge label="CFG" value={extractedData.cfgScale} />}
              {extractedData.seed && <Badge label="Seed" value={extractedData.seed} />}
            </div>

            {/* Prompt Principal */}
            <div className="neo-border bg-(--bg-secondary) p-0 flex flex-col overflow-hidden">
              <div className="bg-background border-b-2 border-(--border-color) p-2 flex justify-between items-center">
                <span className="font-mono font-bold text-sm text-(--accent-color)">PROMPT</span>
                <button
                  onClick={() => copyToClipboard(extractedData.prompt, "prompt")}
                  className="hover:text-(--accent-color) transition-colors"
                >
                  {copiedKey === "prompt" ? (
                    <IconCheck size={18} className="text-green-500" />
                  ) : (
                    <IconCopy size={18} />
                  )}
                </button>
              </div>
              <p className="p-4 font-mono text-sm leading-relaxed text-foreground whitespace-pre-wrap">
                {extractedData.prompt}
              </p>
            </div>

            {/* Negative Prompt */}
            {extractedData.negativePrompt && (
              <div className="neo-border bg-(--bg-secondary) p-0 flex flex-col overflow-hidden">
                <div className="bg-background border-b-2 border-(--border-color) p-2 flex justify-between items-center">
                  <span className="font-mono font-bold text-sm text-red-400">NEGATIVE PROMPT</span>
                  <button
                    onClick={() => copyToClipboard(extractedData.negativePrompt, "negative")}
                    className="hover:text-(--accent-color) transition-colors"
                  >
                    {copiedKey === "negative" ? (
                      <IconCheck size={18} className="text-green-500" />
                    ) : (
                      <IconCopy size={18} />
                    )}
                  </button>
                </div>
                <p className="p-4 font-mono text-sm leading-relaxed text-(--text-secondary) whitespace-pre-wrap">
                  {extractedData.negativePrompt}
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// Sub-componente visual para los parámetros
function Badge({ label, value }: { label: string; value: string }) {
  return (
    <div className="neo-border bg-background flex items-center overflow-hidden">
      <span className="bg-(--accent-color) text-white font-mono text-xs font-bold px-2 py-1 border-r-2 border-(--border-color)">
        {label}
      </span>
      <span className="px-3 py-1 font-mono text-sm font-bold text-foreground">{value}</span>
    </div>
  );
}
