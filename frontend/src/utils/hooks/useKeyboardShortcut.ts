import { useEffect } from "react";

export function useKeyboardShortcut(targetKey: string, callback: (e: KeyboardEvent) => void) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const activeElement = document.activeElement?.tagName;
      const isInputActive = activeElement === "INPUT" || activeElement === "TEXTAREA";

      if (e.key === targetKey && !isInputActive) {
        e.preventDefault();
        callback(e);
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [targetKey, callback]);
}
