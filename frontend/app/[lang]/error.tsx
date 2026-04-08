"use client";

import { useEffect, useState } from "react";
import { api } from "@/src/services/api";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const [isSending, setIsSending] = useState(false);
  const [isSent, setIsSent] = useState(false);

  useEffect(() => {
    console.error("💥 [ERROR BOUNDARY] Anomalía detectada:", error);
  }, [error]);

  const handleReport = async () => {
    setIsSending(true);
    try {
      await api.admin.reportBug({
        message: error.message,
        stack: error.stack,
        digest: error.digest,
        url: window.location.href,
        timestamp: new Date().toISOString(),
      });
      setIsSent(true);
    } catch (err) {
      console.error("Error al enviar el reporte", err);
    } finally {
      setIsSending(false);
    }
  };

  return (
    <main className="min-h-screen bg-background flex flex-col items-center justify-center p-4 md:p-8 font-sans">
      <div className="bg-muted/10 p-6 md:p-10 neo-border neo-shadow max-w-2xl w-full text-center space-y-6">
        <h2 className="text-3xl font-black font-mono text-destructive uppercase tracking-widest">
          ¡Fallo en el Sistema! 🛠️
        </h2>
        <p className="text-muted-foreground font-mono text-sm leading-relaxed">
          Nuestros escudos han detectado una anomalía crítica en esta ruta. 
          Haz clic en el botón de abajo para enviar los registros directamente al administrador (<strong>@trosdesuru</strong>).
        </p>

        {process.env.NODE_ENV === "development" && (
          <div className="bg-black/80 p-4 rounded-md text-left overflow-auto text-xs text-red-400 font-mono mt-4 max-h-40 custom-scrollbar neo-border">
            {error.message}
          </div>
        )}

        <div className="flex flex-col sm:flex-row gap-4 justify-center pt-6">
          {isSent ? (
            <div className="px-6 py-3 bg-green-500/10 text-green-500 neo-border font-bold font-mono uppercase tracking-widest text-xs flex items-center justify-center">
              ✅ Reporte Transmitido
            </div>
          ) : (
            <button
              onClick={handleReport}
              disabled={isSending}
              className="px-6 py-3 bg-destructive text-destructive-foreground font-bold font-mono uppercase tracking-widest text-xs neo-border hover:neo-shadow transition-all disabled:opacity-50"
            >
              {isSending ? "Transmitiendo..." : "🚨 Reportar a trosdesuru"}
            </button>
          )}

          <button
            onClick={() => reset()}
            className="px-6 py-3 bg-background text-foreground font-bold font-mono uppercase tracking-widest text-xs neo-border hover:neo-shadow transition-all"
          >
            🔄 Intentar de nuevo
          </button>
        </div>
      </div>
    </main>
  );
}