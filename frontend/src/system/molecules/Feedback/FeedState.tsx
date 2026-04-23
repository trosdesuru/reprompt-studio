import { IconDatabaseOff, IconAlertTriangle } from "@tabler/icons-react";
import { PageLoader } from "../../atoms/Loader/PageLoader";

interface FeedStateProps {
  type: "loading" | "empty" | "error";
  message?: string;
  highlight?: string;
}

export function FeedState({ type, message, highlight }: FeedStateProps) {
  if (type === "loading") {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <PageLoader text="decodificando metadata ..."/>
      </div>
    );
  }

  if (type === "error") {
    return (
      <div className="max-w-md mx-auto mt-8 p-4 bg-red-500/10 border border-red-500/20 text-red-500 rounded-lg flex items-start gap-3 shadow-sm animate-in fade-in slide-in-from-top-4">
        <IconAlertTriangle size={24} className="shrink-0 mt-0.5" />
        <div className="font-mono text-sm leading-relaxed">{message}</div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center py-24 text-muted-foreground bg-muted/10 neo-border border-dashed rounded-lg mt-8">
      <IconDatabaseOff size={64} stroke={1} className="mb-4 opacity-50" />
      <h3 className="text-xl font-bold text-foreground mb-2">Abismo vacío</h3>
      <p className="text-sm max-w-md text-center">
        No encontramos resultados para <span className="text-foreground font-bold">"{highlight}"</span>.
      </p>
    </div>
  );
}
