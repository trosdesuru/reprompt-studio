import { usePromptExtractor } from "@/src/features/extractor/hooks/usePromptExtractor";

export function useFileUploader() {
  const { processFiles } = usePromptExtractor();

  const handleUploadClick = () => {
    const input = document.createElement("input");
    input.type = "file";
    input.multiple = true;
    input.onchange = (e) => {
      const files = (e.target as HTMLInputElement).files;
      if (files) processFiles(Array.from(files));
    };
    input.click();
  };

  return { handleUploadClick };
}
