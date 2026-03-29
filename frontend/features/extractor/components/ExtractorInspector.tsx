import { useState, useCallback } from "react";
import {
  IconCopy,
  IconCheck,
  IconTrash,
  IconPhotoPlus,
  IconBox,
  IconTags,
} from "@tabler/icons-react";
import { Button } from "@/src/components/ui/Button";
import { ExtractedPromptData } from "../utils/promptParser";
import { useDropzone } from "react-dropzone";

interface ExtractorInspectorProps {
  extractedData: ExtractedPromptData;
  previewUrl: string | null;
  onReset: () => void;
  onImageReferenceDrop: (file: File) => void;
}

export function ExtractorInspector({
  extractedData,
  previewUrl,
  onReset,
  onImageReferenceDrop,
}: ExtractorInspectorProps) {
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      if (acceptedFiles.length > 0) onImageReferenceDrop(acceptedFiles[0]);
    },
    [onImageReferenceDrop],
  );
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "image/jpeg": [".jpg", ".jpeg"], "image/png": [".png"] },
    maxFiles: 1,
  });

  return (
    <div className="flex flex-col md:flex-row gap-6 animate-fade-in w-full">
      {/* 🟦 COLUMNA IZQUIERDA: Imagen o Dropzone */}
      <div className="w-full md:w-1/3 flex flex-col gap-4">
        {previewUrl ? (
          <div className="neo-border neo-shadow bg-(--bg-secondary) p-2">
            <img
              src={previewUrl}
              alt="Preview"
              className="w-full h-auto object-contain border-2 border-(--border-color)"
            />
          </div>
        ) : (
          <div
            {...getRootProps()}
            className={`neo-border neo-shadow p-6 flex flex-col items-center justify-center text-center cursor-pointer min-h-75 border-dashed border-4 transition-colors ${isDragActive ? "bg-(--accent-color)/10 border-(--accent-color)" : "bg-(--bg-secondary) border-(--border-color) hover:border-foreground"}`}
          >
            <input {...getInputProps()} />
            <IconPhotoPlus size={48} className="mb-4 text-(--text-secondary)" />
            <h3 className="font-mono font-bold text-lg mb-2">Falta la referencia visual</h3>
            <p className="font-mono text-sm text-(--text-secondary)">
              Arrastra aquí la imagen final (opcional).
            </p>
          </div>
        )}

        <Button
          variant="danger"
          onClick={onReset}
          className="w-full flex items-center justify-center gap-2"
        >
          <IconTrash size={18} /> Limpiar Todo
        </Button>
      </div>

      {/* 🟧 COLUMNA DERECHA: Datos Extraídos */}
      <div className="w-full md:w-2/3 flex flex-col gap-4">
        {/* 1. HEADER TÉCNICO: Software y Resolución */}
        <div className="flex flex-wrap gap-2 mb-2">
          {extractedData.software && (
            <Badge label="Engine" value={extractedData.software} colorClass="bg-purple-500" />
          )}
          {extractedData.resolution && (
            <Badge label="Size" value={extractedData.resolution} colorClass="bg-purple-500" />
          )}
        </div>

        {/* 2. PÍLDORAS TÉCNICAS BÁSICAS */}
        <div className="flex flex-wrap gap-2">
          {extractedData.model && <Badge label="Model" value={extractedData.model} />}
          {extractedData.sampler && <Badge label="Sampler" value={extractedData.sampler} />}
          {extractedData.steps && <Badge label="Steps" value={extractedData.steps} />}
          {extractedData.cfgScale && <Badge label="CFG" value={extractedData.cfgScale} />}
          {extractedData.seed && <Badge label="Seed" value={extractedData.seed} />}
        </div>

        {/* 3. LORAS (Píldoras Doradas) */}
        {extractedData.loras && extractedData.loras.length > 0 && (
          <div className="neo-border bg-yellow-100 p-3 flex flex-col gap-2">
            <div className="flex items-center gap-2 text-yellow-800 font-bold font-mono text-sm uppercase">
              <IconBox size={16} /> LoRAs Detectados
            </div>
            <div className="flex flex-wrap gap-2">
              {extractedData.loras.map((lora, idx) => (
                <div
                  key={idx}
                  className="bg-yellow-400 border-2 border-black px-2 py-1 text-xs font-bold font-mono text-black flex items-center gap-1 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
                >
                  {lora.name}{" "}
                  <span className="bg-black text-yellow-400 px-1 ml-1">{lora.strength}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 4. TRIGGER WORDS (Píldoras Verdes Interactivas) */}
        {extractedData.triggerWords && extractedData.triggerWords.length > 0 && (
          <div className="neo-border bg-green-100 p-3 flex flex-col gap-2">
            <div className="flex items-center gap-2 text-green-800 font-bold font-mono text-sm uppercase">
              <IconTags size={16} /> Trigger Words{" "}
              <span className="text-xs normal-case font-normal">(Click para copiar)</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {extractedData.triggerWords.map((word, idx) => (
                <button
                  key={idx}
                  onClick={() => copyToClipboard(word, `tw-${idx}`)}
                  className="bg-green-400 hover:bg-green-300 transition-colors border-2 border-black px-2 py-1 text-xs font-bold font-mono text-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:translate-y-0.5 active:shadow-none"
                >
                  {copiedKey === `tw-${idx}` ? "¡Copiado!" : word}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* 5. PROMPTS PRINCIPALES */}
        <PromptBox
          title="PROMPT"
          content={extractedData.prompt}
          onCopy={() => copyToClipboard(extractedData.prompt, "prompt")}
          isCopied={copiedKey === "prompt"}
          titleColor="text-(--accent-color)"
        />
        {extractedData.negativePrompt && (
          <PromptBox
            title="NEGATIVE PROMPT"
            content={extractedData.negativePrompt}
            onCopy={() => copyToClipboard(extractedData.negativePrompt || "", "negative")}
            isCopied={copiedKey === "negative"}
            titleColor="text-red-400"
          />
        )}
      </div>
    </div>
  );
}

// 🟢 FIX: Añadimos un prop para cambiar el color de la etiqueta
function Badge({
  label,
  value,
  colorClass = "bg-(--accent-color)",
}: {
  label: string;
  value: string;
  colorClass?: string;
}) {
  return (
    <div className="neo-border bg-background flex items-center overflow-hidden">
      <span
        className={`${colorClass} text-white font-mono text-xs font-bold px-2 py-1 border-r-2 border-(--border-color)`}
      >
        {label}
      </span>
      <span className="px-3 py-1 font-mono text-sm font-bold text-foreground">{value}</span>
    </div>
  );
}

function PromptBox({ title, content, onCopy, isCopied, titleColor }: any) {
  return (
    <div className="neo-border bg-(--bg-secondary) p-0 flex flex-col overflow-hidden">
      <div className="bg-background border-b-2 border-(--border-color) p-2 flex justify-between items-center">
        <span className={`font-mono font-bold text-sm ${titleColor}`}>{title}</span>
        <button onClick={onCopy} className="hover:text-(--accent-color) transition-colors">
          {isCopied ? <IconCheck size={18} className="text-green-500" /> : <IconCopy size={18} />}
        </button>
      </div>
      <p className="p-4 font-mono text-sm leading-relaxed text-foreground whitespace-pre-wrap">
        {content}
      </p>
    </div>
  );
}
