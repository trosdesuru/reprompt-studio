import { useState } from "react";
import { IconCopy, IconCheck, IconTrash } from "@tabler/icons-react";
import { Button } from "@/src/components/ui/Button";
import { ExtractedPromptData } from "@/src/utils/promptParser"; // Asumiendo que ya creamos el parser

interface ExtractorInspectorProps {
  extractedData: ExtractedPromptData;
  previewUrl: string;
  onReset: () => void;
}

export function ExtractorInspector({
  extractedData,
  previewUrl,
  onReset,
}: ExtractorInspectorProps) {
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  return (
    <div className="flex flex-col md:flex-row gap-6 animate-fade-in w-full">
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
          onClick={onReset}
          className="w-full flex items-center justify-center gap-2"
        >
          <IconTrash size={18} /> Subir otra
        </Button>
      </div>

      {/* Columna Derecha: Datos */}
      <div className="w-full md:w-2/3 flex flex-col gap-4">
        <div className="flex flex-wrap gap-2">
          {extractedData.model && <Badge label="Model" value={extractedData.model} />}
          {extractedData.sampler && <Badge label="Sampler" value={extractedData.sampler} />}
          {extractedData.steps && <Badge label="Steps" value={extractedData.steps} />}
          {extractedData.cfgScale && <Badge label="CFG" value={extractedData.cfgScale} />}
          {extractedData.seed && <Badge label="Seed" value={extractedData.seed} />}
        </div>

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

// Sub-componentes modulares y limpios
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
