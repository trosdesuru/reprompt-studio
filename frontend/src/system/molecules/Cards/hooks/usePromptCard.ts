import { useState } from "react";
import toast from "react-hot-toast";

export function usePromptCard() {
  const [isHovered, setIsHovered] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleCopy = (text: string) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopied(true);
    toast.success("Prompt copiado");
    setTimeout(() => setCopied(false), 2000);
  };

  return {
    isHovered,
    setIsHovered,
    isMenuOpen,
    setIsMenuOpen,
    copied,
    handleCopy,
  };
}
