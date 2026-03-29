import { IconBox, IconTags } from "@tabler/icons-react";
import { useState } from "react";
import { ExtractedPromptData } from "../../utils/parsers/types";

export function InspectorResources({ data }: { data: ExtractedPromptData }) {
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const copy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  return (
    <div className="space-y-4">
      {/* LoRAs */}
      {data.loras && data.loras.length > 0 && (
        <div className="neo-border bg-yellow-100 p-3 space-y-2">
          <div className="flex items-center gap-2 text-yellow-800 font-bold font-mono text-xs uppercase">
            <IconBox size={14} /> LoRAs Detectados
          </div>
          <div className="flex flex-wrap gap-2">
            {data.loras.map((lora, i) => (
              <div key={i} className="bg-yellow-400 border-2 border-black px-2 py-1 text-[10px] font-bold font-mono text-black flex items-center gap-1 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                {lora.name} <span className="bg-black text-yellow-400 px-1 ml-1">{lora.strength}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Trigger Words */}
      {data.triggerWords && data.triggerWords.length > 0 && (
        <div className="neo-border bg-green-100 p-3 space-y-2">
          <div className="flex items-center gap-2 text-green-800 font-bold font-mono text-xs uppercase">
            <IconTags size={14} /> Trigger Words
          </div>
          <div className="flex flex-wrap gap-2">
            {data.triggerWords.map((word, i) => (
              <button key={i} onClick={() => copy(word, `tw-${i}`)} className="bg-green-400 hover:bg-green-300 border-2 border-black px-2 py-1 text-[10px] font-bold font-mono text-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:translate-y-px active:shadow-none transition-all">
                {copiedKey === `tw-${i}` ? "¡COPIADO!" : word}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
