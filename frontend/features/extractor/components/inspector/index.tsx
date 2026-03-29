import { useState } from "react";
import { ExtractedPromptData } from "../../utils/parsers/types";
import { InspectorBadges } from "./InspectorBadges";
import { InspectorResources } from "./InspectorResources";
import { InspectorPromptBox } from "./InspectorPromptBox";
import { Button } from "@/src/components/ui/Button";
import { IconTrash, IconDeviceFloppy } from "@tabler/icons-react";
import { api } from "@/src/services/api";
import { handleError } from "@/src/utils/errors/ErrorHandler";

interface Props {
  data: ExtractedPromptData;
  previewUrl: string | null;
  onReset: () => void;
}

export function ExtractorInspector({ data, previewUrl, onReset }: Props) {
  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<"idle" | "success" | "error">("idle");

  const handleSave = async () => {
    setIsSaving(true);
    setSaveStatus("idle");

    try {
      const payload = {
        title: `Gen - ${data.software || "IA"}`,
        prompt: data.prompt,
        negative_prompt: data.negativePrompt,
        software: data.software,
        model: data.model,
        sampler: data.sampler,
        steps: data.steps,
        cfg_scale: data.cfgScale,
        seed: data.seed,
        resolution: data.resolution,
        extra_data: {
          loras: data.loras || [],
          triggerWords: data.triggerWords || [],
        },
      };

      await api.guardarPrompt(payload);
      setSaveStatus("success");

      setTimeout(() => setSaveStatus("idle"), 3000);
    } catch (err: unknown) {
      handleError(err, "GuardarPrompt");
      setSaveStatus("error");
      setTimeout(() => setSaveStatus("idle"), 3000);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="flex flex-col lg:flex-row gap-8 animate-fade-in">
      <div className="w-full lg:w-1/3 space-y-6">
        <div className="neo-border neo-shadow p-2 bg-(--bg-secondary)">
          {previewUrl ? (
            <img
              src={previewUrl}
              className="w-full h-auto border-2 border-(--border-color)"
              alt="IA Preview"
            />
          ) : (
            <div className="aspect-square flex items-center justify-center border-2 border-dashed border-(--border-color) font-mono text-xs text-(--text-secondary) p-8 text-center">
              Sin referencia visual
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 gap-3">
          <Button
            onClick={handleSave}
            variant={saveStatus === "error" ? "danger" : "primary"}
            isLoading={isSaving}
            disabled={saveStatus === "success"}
            className="w-full flex justify-center gap-2"
          >
            {saveStatus === "success" ? (
              "✅ ¡GUARDADO!"
            ) : (
              <>
                <IconDeviceFloppy size={18} /> Guardar en Búnker
              </>
            )}
          </Button>

          <Button
            onClick={onReset}
            variant="ghost"
            className="w-full flex justify-center gap-2 border-2 border-dashed border-(--border-color)"
          >
            <IconTrash size={18} /> Nueva Extracción
          </Button>
        </div>
      </div>

      <div className="w-full lg:w-2/3 space-y-6">
        <InspectorBadges data={data} />
        <InspectorResources data={data} />
        <div className="space-y-4">
          <InspectorPromptBox title="Prompt" content={data.prompt} color="text-(--accent-color)" />
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
