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

    console.log("🛠️ [DEBUG FRONTEND] 1. Botón Guardar pulsado");
    console.log(
      "🛠️ [DEBUG FRONTEND] 2. previewUrl actual:",
      previewUrl ? previewUrl.substring(0, 50) + "..." : "NULO",
    );

    try {
      let finalImageUrl = null;

      if (previewUrl) {
        if (previewUrl.startsWith("blob:")) {
          console.log(
            "🛠️ [DEBUG FRONTEND] 3A. Detectado formato BLOB. Iniciando conversión a Base64...",
          );
          const response = await fetch(previewUrl);
          const blob = await response.blob();

          finalImageUrl = await new Promise<string>((resolve) => {
            const reader = new FileReader();
            reader.onloadend = () => {
              console.log("🛠️ [DEBUG FRONTEND] 4. Conversión exitosa. Base64 listo.");
              resolve(reader.result as string);
            };
            reader.readAsDataURL(blob);
          });
        } else {
          console.log("🛠️ [DEBUG FRONTEND] 3B. La imagen ya es una URL normal o Base64.");
          finalImageUrl = previewUrl;
        }
      } else {
        console.warn("⚠️ [DEBUG FRONTEND] No hay previewUrl. El prompt se guardará sin imagen.");
      }

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
        image_url: finalImageUrl, // 🟢 Aquí va la imagen
        extra_data: {
          loras: data.loras || [],
          triggerWords: data.triggerWords || [],
        },
      };

      console.log("🛠️ [DEBUG FRONTEND] 5. Payload listo para enviar al servidor:", {
        ...payload,
        image_url: payload.image_url
          ? `[DATOS DE IMAGEN PRESENTES - Longitud: ${payload.image_url.length}]`
          : "[VACÍO]",
      });

      await api.guardarPrompt(payload);
      console.log("✅ [DEBUG FRONTEND] 6. El backend respondió 200 OK.");

      setSaveStatus("success");
      setTimeout(() => setSaveStatus("idle"), 3000);
    } catch (err: unknown) {
      console.error("💥 [DEBUG FRONTEND] Error en la petición:", err);
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
