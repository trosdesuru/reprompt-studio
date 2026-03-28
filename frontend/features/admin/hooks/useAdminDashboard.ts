// frontend/features/admin/hooks/useAdminDashboard.ts
import { useState, useCallback } from "react";
import { api } from "@/src/services/api";
import { AuditLog } from "../admin.types";

export function useAdminDashboard() {
  const [inviteCode, setInviteCode] = useState<string | null>(null);
  const [isLoadingInvite, setIsLoadingInvite] = useState(false);

  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [isLoadingLogs, setIsLoadingLogs] = useState(false);

  const fetchLogs = useCallback(async () => {
    setIsLoadingLogs(true);
    try {
      const data = await api.obtenerLogsAuditoria(20);
      if (data.status === "success") {
        setLogs(data.logs);
      }
    } catch (err) {
      console.error("Error cargando logs:", err);
    } finally {
      setIsLoadingLogs(false);
    }
  }, []);

  const handleGenerateInvite = async (role: string) => {
    setIsLoadingInvite(true);
    setInviteCode(null);
    try {
      const data = await api.generarInvitacion(role);
      setInviteCode(data.code);
    } catch (error: any) {
      alert(`❌ Error: ${error.message}`);
    } finally {
      setIsLoadingInvite(false);
    }
  };

  const handleRevokeAll = async () => {
    if (
      !confirm(
        "⚠️ ¿Estás seguro? Esto invalidará todas las sesiones en Redis y te expulsará incluso a ti.",
      )
    )
      return;
    try {
      const data = await api.revocarTodasLasSesiones();
      if (data.status === "success") {
        alert("🔒 Sesiones invalidadas con éxito.");
        window.location.href = "/login";
      }
    } catch (err) {
      alert("Error al comunicarse con Redis para revocar sesiones.");
    }
  };

  return {
    logs,
    isLoadingLogs,
    inviteCode,
    isLoadingInvite,
    fetchLogs,
    handleGenerateInvite,
    handleRevokeAll,
  };
}
