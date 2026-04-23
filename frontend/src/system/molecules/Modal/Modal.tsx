"use client";

import { useEffect } from "react";
import { IconX } from "@tabler/icons-react";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  maxWidth?: string;
}

export function Modal({ isOpen, onClose, children, maxWidth = "max-w-md" }: ModalProps) {
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (isOpen) {
      window.addEventListener("keydown", handleEsc);
    }
    return () => window.removeEventListener("keydown", handleEsc);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        className={`bg-background border border-border/50 shadow-xl rounded-xl w-full ${maxWidth} overflow-hidden animate-in zoom-in-95 duration-200 relative flex flex-col`}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1 text-muted-foreground hover:text-foreground transition-colors z-10 rounded-md focus:outline-none focus:ring-2 focus:ring-primary/50"
          aria-label="Cerrar modal"
        >
          <IconX size={20} />
        </button>

        {children}
      </div>
    </div>
  );
}
