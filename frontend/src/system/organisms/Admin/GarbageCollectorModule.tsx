"use client";

import { useState } from "react";
import { api } from "@/src/services/api";
import toast from "react-hot-toast";
import { IconTrashX, IconLoader2, IconAlertTriangle } from "@tabler/icons-react";

export function GarbageCollectorModule() {
  const [isPurging, setIsPurging] = useState(false);
  const [confirmStep, setConfirmStep] = useState(false);

  const handlePurge = async () => {
    if (!confirmStep) {
      setConfirmStep(true);
      setTimeout(() => setConfirmStep(false), 3000);
      return;
    }

    setIsPurging(true);
    try {
      const result = await api.admin.runGarbageCollector();

      toast.success(
        <div>
          <b>¡Purga Exitosa!</b>
          <p className="text-xs mt-1">
            Logs: {result.deleted_logs} | Invites: {result.deleted_invites} | Archivos R2:{" "}
            {result.deleted_temp_files}
          </p>
        </div>,
        { duration: 5000 },
      );
      setConfirmStep(false);
    } catch (error: any) {
      toast.error(error.message || "Fallo crítico en el recolector de basura");
    } finally {
      setIsPurging(false);
    }
  };

  return (
    <div className="bg-red-500/5 border border-red-500/20 p-6 rounded-xl shadow-sm flex flex-col justify-between h-full relative overflow-hidden group">
      {/* Fondo de alerta sutil */}
      <IconAlertTriangle
        size={120}
        className="absolute -right-6 -bottom-6 text-red-500/5 -rotate-12 group-hover:scale-110 transition-transform duration-700"
      />

      <div className="relative z-10 mb-6">
        <h3 className="font-bold text-red-500 flex items-center gap-2 uppercase tracking-widest text-sm">
          <IconTrashX size={18} /> Garbage Collector
        </h3>
        <p className="text-xs text-muted-foreground mt-2 font-mono">
          Purga logs de +30 días, invitaciones usadas y vacía la carpeta{" "}
          <code className="text-red-400">/temp</code> de Cloudflare R2 (+24h).
        </p>
      </div>

      <button
        onClick={handlePurge}
        disabled={isPurging}
        className={`relative z-10 w-full py-3 px-4 rounded-lg font-bold text-sm uppercase tracking-widest transition-all ${
          isPurging
            ? "bg-red-500/20 text-red-500 cursor-not-allowed"
            : confirmStep
              ? "bg-red-600 text-white hover:bg-red-700 animate-pulse"
              : "bg-red-500/10 text-red-500 border border-red-500/20 hover:bg-red-500 hover:text-white"
        }`}
      >
        {isPurging ? (
          <span className="flex items-center justify-center gap-2">
            <IconLoader2 size={18} className="animate-spin" /> Purgando Sistema...
          </span>
        ) : confirmStep ? (
          "¿ESTÁS SEGURO? CLIC PARA PURGAR"
        ) : (
          "Ejecutar Purga del Sistema"
        )}
      </button>
    </div>
  );
}
