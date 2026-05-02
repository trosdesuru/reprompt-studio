"use client";

import { useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { DropzoneLoading } from "./DropzoneLoading";
import { DropzoneContent } from "./DropzoneContent";
import { DropzoneError } from "./DropzoneError";

interface ExtractorDropzoneProps {
  onFileDrop: (acceptedFiles: File[], rejectedFiles: any[]) => void;
  isExtracting: boolean;
  error: string | null;
  onOpenInfo: () => void;
}

// 🟢 LA CLAVE: Desestructuramos con { ... } para recibir las funciones correctamente
export function ExtractorDropzone({
  onFileDrop,
  isExtracting,
  error: externalError,
  onOpenInfo,
}: ExtractorDropzoneProps) {
  const onDrop = useCallback(
    (acceptedFiles: File[], fileRejections: any[]) => {
      // Verificamos que la función existe antes de llamarla (seguridad extra)
      if (typeof onFileDrop === "function") {
        onFileDrop(acceptedFiles, fileRejections);
      } else {
        console.error("❌ Erro de Arquitectura: onFileDrop no llegó como función al Dropzone.");
      }
    },
    [onFileDrop],
  );

  const { getRootProps, getInputProps, isDragActive, isDragReject } = useDropzone({
    onDrop,
    accept: {
      "image/png": [".png"],
      "image/jpeg": [".jpg", ".jpeg"],
      "image/webp": [".webp"],
      "text/plain": [".txt"],
      "application/json": [".json"],
      "application/zip": [".zip"],
      "application/x-zip-compressed": [".zip"],
    },
    disabled: isExtracting,
  });

  if (isExtracting) return <DropzoneLoading />;

  return (
    <div
      {...getRootProps()}
      className={`group relative w-full border-4 border-dashed transition-all duration-300 ease-in-out flex flex-col items-center justify-center min-h-100 cursor-pointer neo-border overflow-hidden ${
        isDragReject
          ? "border-destructive bg-destructive/5"
          : isDragActive
            ? "border-accent bg-accent/5 scale-[1.01] neo-shadow-accent"
            : "border-border bg-muted/5 hover:bg-muted/10 hover:border-foreground/30"
      }`}
    >
      <input {...getInputProps()} />
      <DropzoneContent
        isDragActive={isDragActive}
        isDragReject={isDragReject}
        onOpenInfo={onOpenInfo}
      />
      {externalError && <DropzoneError message={externalError} />}
    </div>
  );
}
