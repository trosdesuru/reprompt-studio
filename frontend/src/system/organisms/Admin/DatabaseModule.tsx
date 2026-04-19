"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import toast from "react-hot-toast";
import { api } from "@/src/services/api";
import { DatabaseStatsResponse } from "@/src/services/api/admin";
import {
  IconUsers,
  IconPhoto,
  IconDatabaseShare,
  IconDotsVertical,
  IconTrash,
  IconKey,
  IconStar,
  IconBan,
  IconExternalLink,
  IconActivity,
} from "@tabler/icons-react";
import { MetricCard } from "../../molecules/Admin/MetricCard";
import { QuotaBar } from "../../molecules/Admin/QuotaBar";
import { UserActivityModal } from "./UserActivityModal";

export function DatabaseModule() {
  const [stats, setStats] = useState<DatabaseStatsResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);

  const [activityModalUser, setActivityModalUser] = useState<{
    id: string;
    username: string;
  } | null>(null);

  const fetchStats = async () => {
    try {
      const data = await api.admin.getDatabaseStats();
      setStats(data);
    } catch (err: any) {
      setError(err.message || "Error de conexión");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const handleAction = async (
    userId: string,
    action: "upgrade" | "deactivate" | "activate" | "reset_password",
  ) => {
    setOpenMenuId(null);
    try {
      const res = await api.admin.manageUser(userId, action);
      if (action === "reset_password") {
        alert(
          `🚨 NUEVA CONTRASEÑA GENERADA:\n\n${res.new_password}\n\nCópiala antes de cerrar. No se volverá a mostrar.`,
        );
      } else {
        toast.success(res.message);
      }
      fetchStats();
    } catch (err: any) {
      toast.error(err.message || "Fallo al ejecutar acción");
    }
  };

  const handleDelete = async (userId: string, username: string) => {
    setOpenMenuId(null);
    const code = prompt(
      `¡PELIGRO! Vas a borrar a @${username} y TODAS sus imágenes de R2.\n\nEscribe EXTERMINAR para confirmar:`,
    );

    if (code === "EXTERMINAR") {
      try {
        toast.loading("Ejecutando exterminio en cascada...", { id: "delete" });
        const res = await api.admin.deleteUser(userId);
        toast.success(res.message, { id: "delete" });
        fetchStats();
      } catch (err: any) {
        toast.error(err.message || "Fallo crítico en borrado", { id: "delete" });
      }
    }
  };

  if (error) return <div className="text-red-500 font-mono">{error}</div>;
  if (isLoading || !stats)
    return <div className="animate-pulse h-64 bg-muted/20 rounded-xl border border-border/50" />;

  return (
    <>
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <MetricCard
            title="Usuarios Totales"
            value={stats.total_users.toLocaleString()}
            icon={<IconUsers size={24} className="text-blue-500" />}
          />
          <MetricCard
            title="Imágenes Indexadas"
            value={stats.total_prompts.toLocaleString()}
            icon={<IconPhoto size={24} className="text-purple-500" />}
          />
          <QuotaBar
            label="Cuota Disco Neon DB (Free Tier)"
            currentMb={stats.total_mb}
            limitMb={stats.limit_mb}
          />
        </div>

        <div className="bg-background border border-border rounded-xl shadow-sm overflow-hidden pb-32">
          <div className="p-4 border-b border-border flex items-center gap-2 bg-muted/20">
            <IconDatabaseShare size={18} className="text-muted-foreground" />
            <h3 className="font-bold text-sm uppercase tracking-widest text-foreground">
              Últimos Registros (Neon DB)
            </h3>
          </div>

          <div className="overflow-x-auto min-h-300px">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-muted-foreground uppercase bg-muted/30 border-b border-border">
                <tr>
                  <th className="px-4 py-3 font-mono">Usuario</th>
                  <th className="px-4 py-3 font-mono">Rol</th>
                  <th className="px-4 py-3 font-mono">Status</th>
                  <th className="px-4 py-3 font-mono text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {stats.users.map((user) => (
                  <tr
                    key={user.id}
                    className={`transition-colors ${
                      !user.is_active ? "opacity-50 bg-red-500/5" : "hover:bg-muted/10"
                    }`}
                  >
                    <td className="px-4 py-3 font-medium text-foreground">
                      @{user.username}
                      {user.email && (
                        <span className="block text-xs font-normal text-muted-foreground">
                          {user.email}
                        </span>
                      )}
                    </td>

                    <td className="px-4 py-3">
                      <span
                        className={`px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider ${
                          user.role === "admin"
                            ? "bg-red-500/10 text-red-500 border border-red-500/20"
                            : user.role === "artist"
                              ? "bg-purple-500/10 text-purple-500 border border-purple-500/20"
                              : "bg-muted text-muted-foreground border border-border"
                        }`}
                      >
                        {user.role}
                      </span>
                    </td>

                    <td className="px-4 py-3">
                      {user.is_active ? (
                        <span className="text-green-500 text-xs font-mono">● Activo</span>
                      ) : (
                        <span className="text-red-500 text-xs font-mono">⊗ BANEADO</span>
                      )}
                    </td>

                    <td className="px-4 py-3 text-right relative">
                      <button
                        onClick={() => setOpenMenuId(openMenuId === user.id ? null : user.id)}
                        className="p-1.5 hover:bg-muted rounded-md transition-colors"
                      >
                        <IconDotsVertical size={18} />
                      </button>

                      {openMenuId === user.id && (
                        <div className="absolute right-8 top-10 z-50 w-52 bg-background border border-border rounded-lg shadow-xl py-1 animate-in fade-in zoom-in-95">
                          <Link
                            href={`/es/${user.username}`}
                            target="_blank"
                            className="flex items-center gap-2 px-3 py-2 text-xs hover:bg-muted/50 w-full text-left"
                          >
                            <IconExternalLink size={14} /> Ver Perfil Público
                          </Link>

                          <button
                            onClick={() => {
                              setActivityModalUser({ id: user.id, username: user.username });
                              setOpenMenuId(null);
                            }}
                            className="flex items-center gap-2 px-3 py-2 text-xs text-blue-500 hover:bg-blue-500/10 w-full text-left"
                          >
                            <IconActivity size={14} /> Ver Rastro de Actividad
                          </button>

                          {user.role === "voyager" && (
                            <button
                              onClick={() => handleAction(user.id, "upgrade")}
                              className="flex items-center gap-2 px-3 py-2 text-xs text-purple-500 hover:bg-purple-500/10 w-full text-left"
                            >
                              <IconStar size={14} /> Ascender a Artist
                            </button>
                          )}

                          <button
                            onClick={() => handleAction(user.id, "reset_password")}
                            className="flex items-center gap-2 px-3 py-2 text-xs text-yellow-600 hover:bg-yellow-500/10 w-full text-left border-t border-border/50 mt-1 pt-2"
                          >
                            <IconKey size={14} /> Forzar Nueva Clave
                          </button>

                          {user.is_active ? (
                            <button
                              onClick={() => handleAction(user.id, "deactivate")}
                              className="flex items-center gap-2 px-3 py-2 text-xs text-orange-500 hover:bg-orange-500/10 w-full text-left"
                            >
                              <IconBan size={14} /> Shadowban (Pausar)
                            </button>
                          ) : (
                            <button
                              onClick={() => handleAction(user.id, "activate")}
                              className="flex items-center gap-2 px-3 py-2 text-xs text-green-500 hover:bg-green-500/10 w-full text-left"
                            >
                              <IconBan size={14} /> Quitar Ban
                            </button>
                          )}

                          <button
                            onClick={() => handleDelete(user.id, user.username)}
                            className="flex items-center gap-2 px-3 py-2 text-xs font-bold text-red-500 hover:bg-red-500/20 w-full text-left border-t border-red-500/20 mt-1 pt-2"
                          >
                            <IconTrash size={14} /> Exterminar Cuenta
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {activityModalUser && (
        <UserActivityModal
          userId={activityModalUser.id}
          username={activityModalUser.username}
          onClose={() => setActivityModalUser(null)}
        />
      )}
    </>
  );
}
