import { ExtractedPromptData } from "../../utils/parsers/types";
import { InspectorBadges } from "./InspectorBadges";
import { InspectorResources } from "./InspectorResources";
import { InspectorPromptBox } from "./InspectorPromptBox";
import { Button } from "@/src/components/ui/Button";
import { IconTrash } from "@tabler/icons-react";

interface Props {
  data: ExtractedPromptData;
  previewUrl: string | null;
  onReset: () => void;
}

export function ExtractorInspector({ data, previewUrl, onReset }: Props) {
  return (
    <div className="flex flex-col lg:flex-row gap-8 animate-fade-in">
      {/* 🟦 COLUMNA IZQUIERDA: Imagen y Acciones */}
      <div className="w-full lg:w-1/3 space-y-6">
        <div className="neo-border neo-shadow p-2 bg-(--bg-secondary)">
          {previewUrl ? (
            <img src={previewUrl} className="w-full h-auto border-2 border-(--border-color)" alt="IA Preview" />
          ) : (
            <div className="aspect-square flex items-center justify-center border-2 border-dashed border-(--border-color) font-mono text-xs text-(--text-secondary) p-8 text-center">
              Sin referencia visual
            </div>
          )}
        </div>
        
        <div className="grid grid-cols-1 gap-3">
          <Button onClick={onReset} variant="danger" className="w-full flex justify-center gap-2">
            <IconTrash size={18} /> Nueva Extracción
          </Button>
        </div>
      </div>

      {/* 🟧 COLUMNA DERECHA: Datos Extraídos */}
      <div className="w-full lg:w-2/3 space-y-6">
        <InspectorBadges data={data} />
        
        <InspectorResources data={data} />

        <div className="space-y-4">
          <InspectorPromptBox 
            title="Prompt" 
            content={data.prompt} 
            color="text-(--accent-color)" 
          />
          
          {data.negativePrompt && (
            <InspectorPromptBox 
              title="Negative Prompt" 
              content={data.negativePrompt} 
              color="text-red-500" 
            />
          )}
        </div>
      </div>
    </div>
  );
}
