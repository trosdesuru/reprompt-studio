"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/src/store/authStore";
import { api } from "@/src/services/api";
import { Button } from "@/src/components/ui/Button";

// Definimos la estructura de los Logs
interface AuditLog {
  id: number;
  username: string;
  action: string;
  details: string;
  timestamp: string;
}

export default function AdminDashboard() {
  const { user, isLoadingAuth } = useAuthStore();
  const router = useRouter();
  
  // Estados
  const [inviteCode, setInviteCode] = useState<string | null>(null);
  const [isLoadingInvite, setIsLoadingInvite] = useState(false);
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [isLoadingLogs, setIsLoadingLogs] = useState(false);

  // 🛡️ Protección de ruta: Solo admins pasan de aquí
  useEffect(() => {
    if (!isLoadingAuth && (!user || user.role !== "admin")) {
      router.push("/");
    }
  }, [user, isLoadingAuth, router]);

  // Cargar datos iniciales
  useEffect(() => {
    if (user?.role === "admin") {
      fetchLogs();
    }
  }, [user]);

  const fetchLogs = async () => {
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
  };

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
    if (!confirm("⚠️ ¿Estás seguro? Esto invalidará todas las sesiones en Redis y te expulsará incluso a ti.")) return;
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

  // Pantalla de carga mientras verificamos quién es el usuario
  if (isLoadingAuth || !user || user.role !== "admin") {
    return (
      <div className="min-h-screen flex items-center justify-center font-mono text-foreground bg-background">
        <span className="animate-pulse">CARGANDO PROTOCOLOS DE MANDO...</span>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-background text-foreground p-4 md:p-8 font-sans pb-20">
      <div className="max-w-7xl mx-auto">
        
        {/* CABECERA */}
        <header className="mb-12 border-b-4 border-(--border-color) pb-6">
          <h1 className="text-4xl md:text-6xl font-black font-mono uppercase italic">
            Admin<span className="text-(--accent-color)">_</span>Terminal
          </h1>
          <p className="text-(--text-secondary) font-mono text-sm mt-2">Acceso concedido a: {user.username} [ROOT_ACCESS]</p>
        </header>

        {/* GRID DE MÓDULOS SUPERIORES */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
          
          {/* MÓDULO 1: GESTIÓN DE ACCESOS */}
          <section className="bg-(--bg-secondary) p-6 neo-border neo-shadow flex flex-col gap-4">
            <h2 className="text-xl font-black font-mono uppercase flex items-center gap-2">
              <span className="w-3 h-3 bg-blue-500 rounded-full"></span> Invitaciones
            </h2>
            <p className="text-xs text-(--text-secondary) leading-relaxed">Genera códigos únicos para nuevos usuarios.</p>
            
            <div className="flex flex-col gap-2 mt-2">
              <Button onClick={() => handleGenerateInvite("voyager")} isLoading={isLoadingInvite} variant="primary">
                + Código Voyager
              </Button>
              <Button onClick={() => handleGenerateInvite("artist")} isLoading={isLoadingInvite} variant="secondary">
                + Código Artist
              </Button>
            </div>

            {inviteCode && (
              <div className="mt-4 p-4 bg-background border-2 border-dashed border-(--accent-color) flex flex-col items-center gap-2">
                <span className="text-[10px] font-bold uppercase opacity-50">Código Activo:</span>
                <code className="text-xl font-black text-(--accent-color) select-all tracking-widest">{inviteCode}</code>
              </div>
            )}
          </section>

          {/* MÓDULO 2: SEGURIDAD CRÍTICA (REDIS) */}
          <section className="bg-(--bg-secondary) p-6 neo-border neo-shadow flex flex-col gap-4 border-red-500/20">
            <h2 className="text-xl font-black font-mono uppercase flex items-center gap-2 text-red-500">
              <span className="w-3 h-3 bg-red-500 rounded-full animate-ping"></span> Seguridad
            </h2>
            <p className="text-xs text-(--text-secondary) leading-relaxed">
              Gestión de sesiones activas en Redis. La revocación es instantánea y global.
            </p>
            <div className="mt-auto">
              <Button onClick={handleRevokeAll} className="w-full bg-red-600/10 hover:bg-red-600 hover:text-white border-red-600 text-red-500 transition-all font-black text-xs">
                REVOCAR TODAS LAS SESIONES
              </Button>
            </div>
          </section>

          {/* MÓDULO 3: ESTADÍSTICAS RÁPIDAS */}
          <section className="bg-(--bg-secondary) p-6 neo-border neo-shadow flex flex-col items-center justify-center text-center">
            <span className="text-7xl font-black font-mono text-(--accent-color)">{logs.length}</span>
            <span className="text-[10px] font-bold uppercase tracking-widest mt-2 opacity-60">Eventos en Auditoría</span>
          </section>
        </div>

        {/* MÓDULO 4: TABLA DE AUDITORÍA (FULL WIDTH) */}
        <section className="bg-(--bg-secondary) p-6 neo-border neo-shadow">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-black font-mono uppercase">Registro de Actividad</h2>
            <Button onClick={fetchLogs} isLoading={isLoadingLogs} variant="ghost" size="sm" className="text-xs">
              ACTUALIZAR_LOGS
            </Button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left font-mono text-xs border-collapse">
              <thead>
                <tr className="border-b-2 border-(--border-color) bg-background/50">
                  <th className="p-4 uppercase font-black opacity-60">Timestamp</th>
                  <th className="p-4 uppercase font-black opacity-60">Operador</th>
                  <th className="p-4 uppercase font-black opacity-60">Acción</th>
                  <th className="p-4 uppercase font-black opacity-60">Detalles de Operación</th>
                </tr>
              </thead>
              <tbody>
                {logs.length === 0 ? (
                  <tr><td colSpan={4} className="p-10 text-center opacity-40 italic">No hay registros de sistema disponibles.</td></tr>
                ) : (
                  logs.map((log: AuditLog) => (
                    <tr key={log.id} className="border-b border-(--border-color) hover:bg-background/30 transition-colors">
                      <td className="p-4 whitespace-nowrap opacity-70">
                        {new Date(log.timestamp).toLocaleString()}
                      </td>
                      <td className="p-4 font-black text-(--accent-color)">@{log.username}</td>
                      <td className="p-4">
                        <span className="px-2 py-1 bg-foreground text-background font-black text-[9px]">
                          {log.action}
                        </span>
                      </td>
                      <td className="p-4 max-w-md truncate hover:whitespace-normal" title={log.details}>
                        {log.details}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </section>

      </div>
    </main>
  );
}