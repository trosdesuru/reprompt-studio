import { Button } from "@/src/components/ui/Button";

interface ViewerHeaderProps {
  title: string;
  onClose: () => void;
}

export function ViewerHeader({ title, onClose }: ViewerHeaderProps) {
  return (
    <div className="flex-none flex justify-between items-center p-4 bg-(--bg-secondary) border-b-4 border-(--border-color) z-30">
      <h2 className="text-xl md:text-2xl font-black text-foreground font-mono truncate w-2/3 uppercase tracking-tighter">
        {title}
      </h2>
      <Button onClick={onClose} variant="danger" size="md">
        Cerrar ✖
      </Button>
    </div>
  );
}
