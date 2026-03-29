"use client";

import { useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { DropzoneLoading } from "./DropzoneLoading";
import { DropzoneContent } from "./DropzoneContent";
import { DropzoneError } from "./DropzoneError";

interface ExtractorDropzoneProps {
  onFileDrop: (acceptedFiles: File[], rejectedFiles: any[]) => void; // 🟢 Actualizada la firma
  isExtracting: boolean;
  error: string | null;
}

export function ExtractorDropzone({
  onFileDrop,
  isExtracting,
  error: externalError,
}: ExtractorDropzoneProps) {
  const onDrop = useCallback(
    (acceptedFiles: File[], fileRejections: any[]) => {
      // 🟢 Pasamos todo al Hook, él se encargará de clasificar y avisar
      if (acceptedFiles.length > 0 || fileRejections.length > 0) {
        onFileDrop(acceptedFiles, fileRejections);
      }
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
      "application/zip": [".zip"],
      "application/x-zip-compressed": [".zip"],
    },
    disabled: isExtracting,
    // 🟢 Sin maxFiles: Acepta múltiples imágenes o zips a la vez
  });

  if (isExtracting) return <DropzoneLoading />;

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
      {externalError && <DropzoneError message={externalError} />}
    </div>
  );
}
