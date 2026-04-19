import { useState } from "react";

export function usePromptActions() {
  const [copied, setCopied] = useState(false);

  const copyToClipboard = (text: string) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const confirmDeletion = (onConfirm: () => void) => {
    if (window.confirm("¿Seguro que deseas eliminar este rastro digital?")) {
      onConfirm();
    }
  };

  return { copied, copyToClipboard, confirmDeletion };
}
