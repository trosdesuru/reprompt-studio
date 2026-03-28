import { useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { IconUpload, IconWand } from "@tabler/icons-react";

interface ExtractorDropzoneProps {
  onFileDrop: (file: File) => void;
  isExtracting: boolean;
  error: string | null;
}

export function ExtractorDropzone({ onFileDrop, isExtracting, error }: ExtractorDropzoneProps) {
  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      if (acceptedFiles.length > 0) {
        onFileDrop(acceptedFiles[0]);
      }
    },
    [onFileDrop],
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "image/png": [".png"] },
    maxFiles: 1,
    disabled: isExtracting,
  });

  if (isExtracting) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[300px] animate-pulse bg-(--bg-secondary) neo-border">
        <IconWand size={64} className="text-(--accent-color) animate-spin" />
        <h2 className="text-xl font-black font-mono uppercase mt-4">Extrayendo Magia...</h2>
      </div>
    );
  }

  return (
    <div
      {...getRootProps()}
      className={`border-4 border-dashed transition-all duration-300 ease-in-out flex flex-col items-center justify-center min-h-[300px] cursor-pointer neo-border bg-(--bg-secondary) ${
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
