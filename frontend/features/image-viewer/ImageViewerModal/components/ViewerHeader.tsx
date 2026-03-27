import { Button } from "@/src/components/ui/Button";

interface ViewerHeaderProps {
  title: string;
  onClose: () => void;
}

export function ViewerHeader({ title, onClose }: ViewerHeaderProps) {
  return (
    <div className="flex-none flex justify-between items-center p-4 bg-black/50 border-b-[3px] border-(--accent-color) z-30 backdrop-blur-sm">
      <h2 className="text-xl md:text-2xl font-black text-white font-mono truncate w-2/3 uppercase tracking-tighter">
        {title}
      </h2>
      <Button onClick={onClose} variant="danger" size="md">
        Cerrar ✖
      </Button>
    </div>
  );
}
