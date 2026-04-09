"use client";

import { useEffect, useState } from "react";
import { api } from "@/src/services/api";
import { StorageStatsResponse } from "@/src/services/api/admin";
import toast from "react-hot-toast";
import {
  IconCloudDataConnection,
  IconFiles,
  IconAlertCircle,
  IconServer,
  IconFlame,
} from "@tabler/icons-react";
import { QuotaBar } from "../../molecules/Admin/QuotaBar";

export function StorageModule() {
  const [stats, setStats] = useState<StorageStatsResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [isPurging, setIsPurging] = useState(false);
  const [confirmPurge, setConfirmPurge] = useState(false);

  const fetchStorage = async () => {
    try {
      const data = await api.admin.getStorageStats();
      setStats(data);
    } catch (err: any) {
      setError(err.message || "Error al conectar con Cloudflare R2");
    }
  };

  useEffect(() => {
    let isMounted = true;

    const initialFetch = async () => {
      try {
        setIsLoading(true);
        const data = await api.admin.getStorageStats();
        if (isMounted) setStats(data);
      } catch (err: any) {
        if (isMounted) setError(err.message || "Error al conectar con Cloudflare R2");
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    initialFetch();
    return () => {
      isMounted = false;
    };
  }, []);

  const handlePurge = async () => {
    if (!confirmPurge) {
      setConfirmPurge(true);
      setTimeout(() => setConfirmPurge(false), 4000);
      return;
    }

    const finalConfirm = prompt(
      "ESTO BORRARÁ TODO EL BUCKET R2.\nEscribe DESTRUIR para confirmar:",
    );
    if (finalConfirm !== "DESTRUIR") {
      setConfirmPurge(false);
      return;
    }

    setIsPurging(true);
    try {
      toast.loading("Aniquilando bucket R2...", { id: "purge" });
      const result = await api.admin.purgeStorage();
      toast.success(result.message, { id: "purge", duration: 5000 });
      await fetchStorage();
    } catch (error: any) {
      toast.error(error.message || "Fallo al purgar R2", { id: "purge" });
    } finally {
      setIsPurging(false);
      setConfirmPurge(false);
    }
  };

  if (error) {
    return (
      <div className="p-6 bg-red-500/10 border border-red-500/20 rounded-xl flex items-start gap-3 text-red-500">
        <IconAlertCircle className="shrink-0 mt-0.5" />
        <div>
          <h3 className="font-bold">Alerta de Infraestructura (R2)</h3>
          <p className="text-sm opacity-80">{error}</p>
        </div>
      </div>
    );
  }

  if (isLoading || !stats) {
    return <StorageModuleSkeleton />;
  }

  const isStorageHealthy = stats.total_mb < 10000;

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <QuotaBar
        label="Cuota Mensual Cloudflare R2 (Free Tier)"
        currentMb={stats.total_mb}
        limitMb={stats.limit_mb}
      />

      <div
        className={`p-4 border rounded-xl flex items-center justify-between shadow-sm ${
          isStorageHealthy
            ? "bg-green-500/10 border-green-500/20"
            : "bg-yellow-500/10 border-yellow-500/20"
        }`}
      >
        <div className="flex items-center gap-3">
          <IconCloudDataConnection
            className={isStorageHealthy ? "text-green-500" : "text-yellow-500"}
          />
          <div>
            <h3
              className={`font-bold text-sm uppercase tracking-widest ${isStorageHealthy ? "text-green-600 dark:text-green-400" : "text-yellow-600 dark:text-yellow-400"}`}
            >
              Cloudflare R2 (Object Storage)
            </h3>
            <p className="text-xs text-muted-foreground font-mono">
              {isStorageHealthy ? "Operativo y Saludable" : "Acercándose a cuota límite"}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 text-xs font-mono">
          <span className="relative flex h-3 w-3">
            <span
              className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${isStorageHealthy ? "bg-green-400" : "bg-yellow-400"}`}
            ></span>
            <span
              className={`relative inline-flex rounded-full h-3 w-3 ${isStorageHealthy ? "bg-green-500" : "bg-yellow-500"}`}
            ></span>
          </span>
          En línea
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-background border border-border p-5 rounded-xl shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-1">
              Ancho de Disco
            </p>
            <p className="text-3xl font-black text-foreground">
              {Number(stats.total_mb).toFixed(2)}{" "}
              <span className="text-sm text-muted-foreground font-normal">MB</span>
            </p>
          </div>
          <div className="p-3 bg-muted/30 rounded-lg text-blue-500">
            <IconServer size={24} />
          </div>
        </div>

        <div className="bg-background border border-border p-5 rounded-xl shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-1">
              Archivos en R2
            </p>
            <p className="text-3xl font-black text-foreground">
              {stats.total_files.toLocaleString()}
            </p>
          </div>
          <div className="p-3 bg-muted/30 rounded-lg text-purple-500">
            <IconFiles size={24} />
          </div>
        </div>
      </div>

      <button
        onClick={handlePurge}
        disabled={isPurging}
        className={`w-full py-3 px-4 rounded-xl font-bold text-sm uppercase tracking-widest transition-all flex items-center justify-center gap-2 ${
          isPurging
            ? "bg-red-500/20 text-red-500 cursor-not-allowed"
            : confirmPurge
              ? "bg-red-600 text-white hover:bg-red-700 animate-pulse border border-red-500 shadow-lg shadow-red-500/20"
              : "bg-red-500/5 text-red-500 border border-red-500/20 hover:bg-red-500/10"
        }`}
      >
        <IconFlame size={18} />
        {isPurging
          ? "Aniquilando..."
          : confirmPurge
            ? "¿SEGURO? ESTO BORRARÁ TODO EL BUCKET"
            : "Purgar Bucket Completo (Hard Reset)"}
      </button>
    </div>
  );
}

function StorageModuleSkeleton() {
  return (
    <div className="space-y-6">
      <div className="h-74px bg-muted/40 rounded-xl animate-pulse border border-border/50"></div>
      <div className="h-74px bg-muted/40 rounded-xl animate-pulse border border-border/50"></div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="h-28 bg-muted/40 rounded-xl animate-pulse border border-border/50"></div>
        <div className="h-28 bg-muted/40 rounded-xl animate-pulse border border-border/50"></div>
      </div>
      <div className="h-12 bg-muted/40 rounded-xl animate-pulse border border-border/50"></div>
    </div>
  );
}
