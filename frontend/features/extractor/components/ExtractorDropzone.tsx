"use client";

import { useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { IconUpload, IconWand } from "@tabler/icons-react";

interface ExtractorDropzoneProps {
  onFileDrop: (file: File) => void;
  isExtracting: boolean;
  error: string | null;
}

export function ExtractorDropzone({ onFileDrop, isExtracting, error }: ExtractorDropzoneProps) {
  // 🟢 AÑADIDOS LOGS Y CONTROL DE RECHAZOS
  const onDrop = useCallback(
    (acceptedFiles: File[], fileRejections: any[]) => {
      console.log("📥 ¡Acción de Drag & Drop detectada!");
      console.log("✅ Archivos Aceptados:", acceptedFiles);
      console.log("❌ Archivos Rechazados:", fileRejections);

      // Si la librería rechaza el archivo (ej: es un JPG), lanzamos una alerta
      if (fileRejections.length > 0) {
        const errorMsg = fileRejections[0].errors[0]?.message || "Archivo no válido";
        alert(
          `⚠️ El archivo fue rechazado por el Dropzone:\n${errorMsg}\n\nAsegúrate de arrastrar un archivo .png original.`,
        );
      }

      // Si es válido, lo pasamos al Orquestador
      if (acceptedFiles.length > 0) {
        console.log("🚀 Enviando archivo al motor de extracción...");
        onFileDrop(acceptedFiles[0]);
      }
    },
    [onFileDrop],
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "image/png": [".png"],
      "image/jpeg": [".jpg", ".jpeg"],
    },
    maxFiles: 1,
    disabled: isExtracting,
  });

  if (isExtracting) {
    return (
      <div className="flex flex-col items-center justify-center min-h-75 animate-pulse bg-(--bg-secondary) neo-border">
        <IconWand size={64} className="text-(--accent-color) animate-spin" />
        <h2 className="text-xl font-black font-mono uppercase mt-4">Extrayendo Magia...</h2>
      </div>
    );
  }

  return (
    <div
      {...getRootProps()}
      className={`border-4 border-dashed transition-all duration-300 ease-in-out flex flex-col items-center justify-center min-h-75 cursor-pointer neo-border bg-(--bg-secondary) ${
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
        {isDragActive ? "¡Suelta tu imagen aquí!" : "Arrastra tu generación IA"}
      </h2>
      <p className="text-(--text-secondary) font-mono text-sm max-w-md text-center">
        Soporta PNGs de Stable Diffusion, ComfyUI y NovelAI.
      </p>

      {error && (
        <div className="mt-6 bg-red-500/10 text-red-500 font-bold p-3 neo-border text-sm">
          ❌ {error}
        </div>
      )}
    </div>
  );
}
