import { IconSparkles, IconX } from "@tabler/icons-react";

interface UpgradeModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  message?: React.ReactNode;
}

export function UpgradeModal({ 
  isOpen, 
  onClose, 
  title = "¡Acelera tu flujo de trabajo!", 
  message = "Pásate al plan Artist para desbloquear funcionalidades premium"
}: UpgradeModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-100 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="relative w-full max-w-lg bg-background rounded-2xl shadow-2xl border border-border p-8 text-center animate-in fade-in zoom-in-95 duration-200">
        
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-muted-foreground hover:bg-muted rounded-full transition-colors"
        >
          <IconX size={20} />
        </button>

        <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-6">
          <IconSparkles size={32} className="text-primary" />
        </div>

        <h2 className="text-2xl font-black text-foreground mb-4">
          {title}
        </h2>
        
        <div className="text-muted-foreground mb-8">
          {message}
        </div>

        <div className="flex flex-col gap-3">
          <button className="w-full bg-accent/20 font-mono text-accent py-3 rounded-xl font-bold hover:bg-accent/30 neo-border border-accent! transition-all">
            Desbloquear Plan Artist
          </button>
          <button 
            onClick={onClose}
            className="w-full text-muted-foreground py-3 font-medium hover:text-foreground transition-colors"
          >
            Quizás más tarde
          </button>
        </div>
      </div>
    </div>
  );
}