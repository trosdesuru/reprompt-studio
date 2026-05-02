"use client";

import { useState } from "react";
import { useAuthStore } from "@/src/store/authStore";

import { Modal } from "@/src/system/molecules/Modal/Modal";
import { Button } from "@/src/system/atoms/Button/Button";
import { IconMessageHeart, IconRocket, IconAlertCircle, IconMoodSmile } from "@tabler/icons-react";
import toast from "react-hot-toast";

interface FeedbackBetaModalProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete: () => void;
}

export function FeedbackBetaModal({ isOpen, onClose, onComplete }: FeedbackBetaModalProps) {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const user = useAuthStore((state) => state.user);
  const [answers, setAnswers] = useState({ pay: "", improve: "", bugs: "" });

  const handleSend = async () => {
    setLoading(true);
    try {
      const payload = {
        username: user?.username || "Anónimo",
        ...answers,
      };
      const res = await fetch("/api/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error("Fallo al enviar");

      setStep(4);
      toast.success("¡Gracias por ayudar que reprompt crezca!");
    } catch (e) {
      console.error(e);
      toast.error("No se pudo enviar el feedback");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} maxWidth="max-w-lg">
      <div className="p-8 flex flex-col gap-6">
        {step < 4 && (
          <div className="flex flex-col items-center text-center gap-2">
            <div className="p-3 bg-accent/10 rounded-full text-accent mb-2">
              <IconRocket size={32} />
            </div>
            <h2 className="text-xl font-black font-mono uppercase tracking-widest text-foreground">
              Feedback de Beta
            </h2>
            <p className="text-xs font-mono text-muted-foreground uppercase">
              Usuario pionero detectado
            </p>
          </div>
        )}

        {step === 1 && (
          <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4">
            <label className="text-sm font-bold text-foreground gap-2">
              ¿Pagarías por una versión Pro de este servicio?
            </label>
            <div className="grid grid-cols-2 gap-2">
              {["Probablemente sí", "No por ahora", "Depende del precio", "Prefiero gratis"].map(
                (opt) => (
                  <button
                    key={opt}
                    onClick={() => {
                      setAnswers({ ...answers, pay: opt });
                      setStep(2);
                    }}
                    className="p-3 text-xs font-mono border border-border hover:border-accent hover:bg-accent/5 transition-all text-left text-foreground"
                  >
                    {opt}
                  </button>
                ),
              )}
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-4 animate-in fade-in slide-in-from-right-4">
            <label className="text-sm font-bold flex items-center gap-2 text-foreground">
              <IconMessageHeart size={18} className="text-accent" /> ¿Qué mejorarías de la
              plataforma?
            </label>
            <textarea
              className="w-full bg-muted/20 border border-border p-4 text-sm font-mono focus:outline-none focus:border-accent min-h-25 text-foreground"
              placeholder="Funcionalidades, diseño, velocidad..."
              onChange={(e) => setAnswers({ ...answers, improve: e.target.value })}
            />
            <Button className="w-full" onClick={() => setStep(3)}>
              Siguiente
            </Button>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-4 animate-in fade-in slide-in-from-right-4">
            <label className="text-sm font-bold flex items-center gap-2 text-foreground">
              <IconAlertCircle size={18} className="text-destructive" /> ¿Has tenido algún problema
              técnico?
            </label>
            <textarea
              className="w-full bg-muted/20 border border-border p-4 text-sm font-mono focus:outline-none focus:border-accent min-h-25 text-foreground"
              placeholder="Bugs, errores de carga, cierres inesperados..."
              onChange={(e) => setAnswers({ ...answers, bugs: e.target.value })}
            />
            <Button className="w-full" isLoading={loading} onClick={handleSend}>
              Enviar Feedback
            </Button>
          </div>
        )}

        {step === 4 && (
          <div className="flex flex-col items-center text-center gap-6 py-4 animate-in zoom-in-95">
            <IconMoodSmile size={64} className="text-accent animate-bounce" />
            <div className="space-y-2">
              <h3 className="text-lg font-black uppercase text-foreground">
                ¡Gracias por tu apoyo!
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Reprompt está en <strong>fase Beta</strong>. Tus respuestas van directamente al
                equipo de ingeniería.
              </p>
            </div>
            <div className="bg-muted/30 border border-dashed border-border p-4 rounded-lg w-full">
              <p className="text-[11px] font-mono text-muted-foreground uppercase tracking-wider leading-snug">
                Recuerda que tienes un botón permanente de <strong>"Sugerencias"</strong> en el menú
                lateral para enviarnos cualquier exigencia o idea en tiempo real.
              </p>
            </div>
            <Button variant="tertiary" className="w-full" onClick={onComplete}>
              Cerrar
            </Button>
          </div>
        )}
      </div>
    </Modal>
  );
}
