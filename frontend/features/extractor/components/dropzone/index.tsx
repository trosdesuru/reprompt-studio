"use client";

import { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import { DropzoneLoading } from "./DropzoneLoading";
import { DropzoneContent } from "./DropzoneContent";
import { DropzoneError } from "./DropzoneError";

interface ExtractorDropzoneProps {
  onFileDrop: (files: File[]) => void; // 🟢 Ahora emite un Array
  isExtracting: boolean;
  error: string | null;
}

export function ExtractorDropzone({
  onFileDrop,
  isExtracting,
  error: externalError,
}: ExtractorDropzoneProps) {
  const [localError, setLocalError] = useState<string | null>(null);

  const onDrop = useCallback(
    (acceptedFiles: File[], fileRejections: any[]) => {
      setLocalError(null);
      if (fileRejections.length > 0) {
        setLocalError("Algún archivo no es soportado. Usa ZIP, PNG, JPG, TXT o JSON.");
      }
      if (acceptedFiles.length > 0) onFileDrop(acceptedFiles);
    },
    [onFileDrop],
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "image/png": [".png"],
      "image/jpeg": [".jpg", ".jpeg"],
      "text/plain": [".txt"],
      "application/json": [".json"],
      "application/zip": [".zip"], // 🟢 Soporte para ZIP
      "application/x-zip-compressed": [".zip"],
    },
    disabled: isExtracting,
    // 🟢 Quitamos maxFiles para permitir arrastrar varios de golpe
  });

  if (isExtracting) return <DropzoneLoading />;

  const activeError = externalError || localError;

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
      <DropzoneContent isDragActive={isDragActive} />
      {activeError && <DropzoneError message={activeError} />}
    </div>
  );
}
