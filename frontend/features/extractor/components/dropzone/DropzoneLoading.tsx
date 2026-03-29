import { IconWand } from "@tabler/icons-react";

export function DropzoneLoading() {
  return (
    <div className="flex flex-col items-center justify-center min-h-75 animate-pulse bg-(--bg-secondary) neo-border">
      <IconWand size={64} className="text-(--accent-color) animate-spin" />
      <h2 className="text-xl font-black font-mono uppercase mt-4">Analizando ADN de la IA...</h2>
    </div>
  );
}
