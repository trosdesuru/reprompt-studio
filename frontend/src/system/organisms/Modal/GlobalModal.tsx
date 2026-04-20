"use client";

import { useGlobalModal } from "@/src/store/useGlobalModal";
import { IconAlertTriangle, IconInfoCircle, IconX } from "@tabler/icons-react";

export function GlobalModal() {
  const { isOpen, config, closeModal } = useGlobalModal();

  if (!isOpen || !config) return null;

  const isDanger = config.type === "danger" || config.type === "warning";
  const Icon = isDanger ? IconAlertTriangle : IconInfoCircle;
  const iconColor = isDanger
    ? "text-red-500 bg-red-500/10"
    : "text-(--accent-color) bg-(--accent-color)/10";
  const confirmBtnStyle = isDanger
    ? "bg-red-500 hover:bg-red-600 text-white"
    : "bg-(--accent-color) hover:bg-(--accent-color)/80 text-foreground";

  return (
    <div className="fixed inset-0 z-9999 flex items-center justify-center bg-background/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-muted/30 border border-border/50 shadow-2xl rounded-2xl w-full max-w-md p-6 relative animate-in zoom-in-95 duration-200">
        <button
          onClick={closeModal}
          className="absolute top-4 right-4 text-muted-foreground hover:text-foreground transition-colors"
        >
          <IconX size={20} />
        </button>

        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-full ${iconColor}`}>
              <Icon size={24} stroke={1.5} />
            </div>
            <h2 className="text-lg font-bold tracking-tight">{config.title}</h2>
          </div>

          <div className="text-muted-foreground text-sm leading-relaxed whitespace-pre-line">
            {config.message}
          </div>

          <div className="flex justify-end gap-3 mt-4 pt-4 border-t border-border/30">
            {config.onConfirm && (
              <button
                onClick={closeModal}
                className="px-4 py-2 rounded-lg text-sm font-medium hover:bg-muted transition-colors"
              >
                {config.cancelText || "Cancelar"}
              </button>
            )}

            <button
              onClick={() => {
                if (config.onConfirm) config.onConfirm();
                closeModal();
              }}
              className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${confirmBtnStyle}`}
            >
              {config.confirmText || "Entendido"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
