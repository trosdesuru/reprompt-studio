import { IconAlertTriangle } from "@tabler/icons-react";

interface DropzoneErrorProps {
  message: string;
}

export function DropzoneError({ message }: DropzoneErrorProps) {
  return (
    <div className="mt-6 mx-6 bg-red-500 text-white font-bold p-3 neo-border flex items-center gap-2 animate-shake">
      <IconAlertTriangle size={20} />
      <span className="text-xs uppercase font-mono">{message}</span>
    </div>
  );
}
