// frontend/app/admin/page.tsx
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/src/store/authStore";
import { api } from "@/src/services/api";
import { Button } from "@/src/components/ui/Button";

// Definimos cómo luce un Log de la DB
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
  const [inviteCode, setInviteCode] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // 🟢 Estados para los Logs
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [isLoadingLogs, setIsLoadingLogs] = useState(false);

  // 🛡️ Protección de ruta
  useEffect(() => {
    if (!isLoadingAuth && (!user || user.role !== "admin")) {
      router.push("/");
    }
  }, [user, isLoadingAuth, router]);

  // 🟢 Cargar Logs al montar el componente (si eres admin)
  useEffect(() => {
    if (user?.role === "admin") {
      fetchLogs();
    }
  }, [user]);

  const fetchLogs = async () => {
    setIsLoadingLogs(true);
    try {
      const data = await api.obtenerLogsAuditoria(20); // Pedimos los últimos 20
      if (data.status === "success") {
        setLogs(data.logs);
      }
    } catch (err) {
      console.error("No se pudieron cargar los logs:", err);
    } finally {
      setIsLoadingLogs(false);
    }
  };

  if (isLoadingAuth || !user || user.role !== "admin") {
    return (
      <div className="min-h-screen flex items-center justify-center font-mono text-foreground bg-background">
        Verificando credenciales...
      </div>
    );
  }

  const handleGenerateInvite = async (role: string) => {
    setIsLoading(true);
    setInviteCode(null);
    try {
      const data = await api.generarInvitacion(role);
      setInviteCode(data.code);
    } catch (error: any) {
      alert(`❌ Error: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-background text-foreground p-4 md:p-8 font-sans pb-20">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl md:text-5xl font-black font-mono uppercase mb-8 border-b-4 border-(--border-color) pb-4 flex items-center gap-4">
          Panel de <span className="text-(--accent-color)">Control</span>
        </h1>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
          {/* 🎟️ MÓDULO 1: FÁBRICA DE INVITACIONES */}
          <div className="bg-(--bg-secondary) p-6 neo-border neo-shadow flex flex-col gap-4">
            <h2 className="text-2xl font-bold font-mono uppercase">Generar Acceso</h2>
            <p className="text-sm text-(--text-secondary)">
              Crea códigos de un solo uso para permitir el registro de nuevos usuarios en la
              plataforma.
            </p>

            <div className="flex gap-4 mt-4">
              <Button
                onClick={() => handleGenerateInvite("voyager")}
                isLoading={isLoading}
                variant="primary"
                className="flex-1 text-xs sm:text-sm"
              >
                + Lector (Voyager)
              </Button>
              <Button
                onClick={() => handleGenerateInvite("artist")}
                isLoading={isLoading}
                variant="secondary"
                className="flex-1 text-xs sm:text-sm"
              >
                + Artista (Pro)
              </Button>
            </div>

            {inviteCode && (
              <div className="mt-6 p-4 bg-background neo-border border-dashed border-4 flex flex-col items-center gap-2 animate-[pulse_1s_ease-in-out]">
                <span className="text-xs font-bold uppercase text-(--text-secondary)">
                  Nuevo Código Generado:
                </span>
                <code className="text-2xl md:text-3xl font-black text-(--accent-color) select-all">
                  {inviteCode}
                </code>
                <span className="text-xs text-center mt-2 text-(--text-secondary)">
                  Cópialo y envíaselo al usuario.
                </span>
              </div>
            )}
          </div>

          {/* 📊 MÓDULO 2: MÉTRICAS RÁPIDAS (Placeholder) */}
          <div className="bg-(--bg-secondary) p-6 neo-border neo-shadow flex flex-col gap-4 justify-center items-center">
            <div className="text-center">
              <p className="text-6xl font-black font-mono text-(--accent-color)">{logs.length}</p>
              <p className="text-sm font-bold uppercase tracking-widest text-(--text-secondary) mt-2">
                Acciones Registradas
              </p>
            </div>
          </div>
        </div>

        {/* 🕵️‍♂️ MÓDULO 3: TABLA DE AUDITORÍA */}
        <div className="bg-(--bg-secondary) p-6 neo-border neo-shadow flex flex-col gap-4">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold font-mono uppercase flex items-center gap-2">
              <span className="text-red-500 animate-pulse">●</span> Logs de Sistema
            </h2>
            <Button onClick={fetchLogs} isLoading={isLoadingLogs} variant="ghost" size="sm">
              ↻ Refrescar
            </Button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left font-mono text-sm border-collapse">
              <thead>
                <tr className="border-b-2 border-(--border-color) bg-background text-(--text-secondary)">
                  <th className="p-3 uppercase">Hora (UTC)</th>
                  <th className="p-3 uppercase">Usuario</th>
                  <th className="p-3 uppercase">Acción</th>
                  <th className="p-3 uppercase">Detalles</th>
                </tr>
              </thead>
              <tbody>
                {logs.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="p-6 text-center text-(--text-secondary)">
                      Ninguna actividad registrada aún.
                    </td>
                  </tr>
                ) : (
                  logs.map((log) => (
                    <tr
                      key={log.id}
                      className="border-b border-(--border-color) hover:bg-background/50 transition-colors"
                    >
                      <td className="p-3 whitespace-nowrap text-xs">
                        {new Date(log.timestamp).toLocaleString()}
                      </td>
                      <td className="p-3 font-bold text-(--accent-color)">@{log.username}</td>
                      <td className="p-3">
                        <span className="bg-background px-2 py-1 neo-border text-[10px] font-black tracking-wider">
                          {log.action}
                        </span>
                      </td>
                      <td
                        className="p-3 truncate max-w-300px hover:whitespace-normal hover:wrap-break-words transition-all"
                        title={log.details}
                      >
                        {log.details}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </main>
  );
}
