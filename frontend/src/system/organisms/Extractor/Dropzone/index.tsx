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
}

export function ExtractorDropzone({
  onFileDrop,
  isExtracting,
  error: externalError,
}: ExtractorDropzoneProps) {
  const onDrop = useCallback(
    (acceptedFiles: File[], fileRejections: any[]) => {
      if (acceptedFiles.length > 0 || fileRejections.length > 0) {
        onFileDrop(acceptedFiles, fileRejections);
      }
    },
    [onFileDrop],
  );

  // 🟢 Extraemos isDragReject
  const { getRootProps, getInputProps, isDragActive, isDragReject } = useDropzone({
    onDrop,
    accept: {
      "image/png": [".png"],
      "image/jpeg": [".jpg", ".jpeg"],
      "image/webp": [".webp"], // Sugiero añadir webp
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
      className={`group relative w-full border-4 border-dashed transition-all duration-300 ease-in-out flex flex-col items-center justify-center min-h-[400px] cursor-pointer neo-border overflow-hidden
        ${
          isDragReject
            ? "border-destructive bg-destructive/5"
            : isDragActive
              ? "border-(--accent-color) bg-(--accent-color)/5 scale-[1.01] neo-shadow-accent"
              : "border-border bg-muted/5 hover:bg-muted/10 hover:border-foreground/30"
        }`}
    >
      <input {...getInputProps()} />
      <DropzoneContent isDragActive={isDragActive} isDragReject={isDragReject} />

      {externalError && <DropzoneError message={externalError} />}
    </div>
  );
}
