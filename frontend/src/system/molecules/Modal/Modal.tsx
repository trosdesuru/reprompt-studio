"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { IconX } from "@tabler/icons-react";
import { Tooltip } from "../../atoms/Tooltip/Tooltip";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  maxWidth?: string;
}

export function Modal({ isOpen, onClose, children, maxWidth = "max-w-md" }: ModalProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (isOpen) {
      document.addEventListener("keydown", handleEsc);
    }
    return () => document.removeEventListener("keydown", handleEsc);
  }, [isOpen, onClose]);

  if (!isOpen || !mounted) return null;

  return createPortal(
    <div className="fixed inset-0 z-9999 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        className={`
          bg-background border border-border/50 rounded-xl w-full ${maxWidth} max-h-[90dvh] overflow-y-auto animate-in zoom-in-95 duration-200 relative flex flex-col
          shadow-[0_0_40px_rgba(0,0,0,0.1)] dark:shadow-[0_0_40px_rgba(255,255,255,0.06)]
          `}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1 text-muted-foreground hover:text-foreground transition-colors z-10 rounded-md focus:outline-none focus:ring-2 focus:ring-primary/50"
          aria-label="Cerrar modal"
        >
          <Tooltip className="z-99999" content="Cerrar">
            <IconX size={20} />
          </Tooltip>
        </button>

        {children}
      </div>
    </div>,
    document.body,
  );
}
