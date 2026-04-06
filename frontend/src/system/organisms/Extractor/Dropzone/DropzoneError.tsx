import { IconAlertTriangle } from "@tabler/icons-react";

interface DropzoneErrorProps {
  message: string;
}

export function DropzoneError({ message }: DropzoneErrorProps) {
  return (
    <div className="absolute bottom-6 mx-auto bg-destructive text-destructive-foreground font-bold px-6 py-3 neo-border flex items-center gap-3 animate-shake z-20 shadow-lg">
      <IconAlertTriangle size={20} stroke={2} />
      <span className="text-xs uppercase font-mono tracking-widest">{message}</span>
    </div>
  );
}
