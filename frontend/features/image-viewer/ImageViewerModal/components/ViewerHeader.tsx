import { Button } from "@/src/components/ui/Button";

interface ViewerHeaderProps {
  title: string;
  onClose: () => void;
}

export function ViewerHeader({ title, onClose }: ViewerHeaderProps) {
  return (
    // 🟢 Restauramos el estilo Neo-Brutalista claro
    <div className="flex-none flex justify-between items-center p-4 bg-(--bg-secondary) border-b-2 border-(--border-color) z-30">
      
      {/* Texto negro con acento en el medio */}
      <h2 className="text-xl md:text-2xl font-black text-foreground font-mono truncate w-2/3 uppercase tracking-tighter">
        Visor <span className="text-(--accent-color)"></span> {title}
      </h2>
      
      <Button onClick={onClose} variant="danger" size="md">
        Cerrar ✖
      </Button>
    </div>
  );
}