import { IconUpload } from "@tabler/icons-react";

interface DropzoneContentProps {
  isDragActive: boolean;
}

export function DropzoneContent({ isDragActive }: DropzoneContentProps) {
  return (
    <>
      <div
        className={`p-6 bg-background rounded-full neo-border mb-4 transition-transform ${isDragActive ? "rotate-12" : ""}`}
      >
        <IconUpload
          size={48}
          className={isDragActive ? "text-(--accent-color) animate-bounce" : "text-foreground"}
        />
      </div>

      <h2 className="text-2xl font-black font-mono uppercase mb-2 text-center px-4">
        {isDragActive ? "¡Suéltalo ahora!" : "Arrastra tu Imagen o Texto IA"}
      </h2>

      <p className="text-(--text-secondary) font-mono text-sm max-w-md text-center px-6">
        PNG, JPG o metadatos en .TXT / .JSON
      </p>
    </>
  );
}
