"use client";

import { useEffect, useState } from "react";
import { api } from "@/src/services/api";
import { UserActivityResponse } from "@/src/services/api/admin";
import { IconX, IconActivity, IconClock } from "@tabler/icons-react";

interface UserActivityModalProps {
  userId: string;
  username: string;
  onClose: () => void;
}

export function UserActivityModal({ userId, username, onClose }: UserActivityModalProps) {
  const [data, setData] = useState<UserActivityResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchActivity = async () => {
      try {
        const res = await api.admin.getUserActivity(userId);
        setData(res);
      } catch (error) {
        console.error(error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchActivity();
  }, [userId]);

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/40 backdrop-blur-sm animate-in fade-in">
      <div className="w-full max-w-md h-full bg-background border-l border-border shadow-2xl flex flex-col animate-in slide-in-from-right-full">
        {/* Cabecera */}
        <div className="p-6 border-b border-border flex justify-between items-center">
          <div>
            <h2 className="text-xl font-black font-mono uppercase italic flex items-center gap-2">
              <IconActivity className="text-(--accent-color)" /> Rastro
            </h2>
            <p className="text-muted-foreground font-mono text-sm mt-1 flex items-center gap-2">
              @{username}
              {data && (
                <span
                  className={`flex items-center gap-1 text-xs font-bold px-2 py-0.5 rounded-full ${
                    data.is_online
                      ? "bg-green-500/10 text-green-500"
                      : "bg-muted text-muted-foreground"
                  }`}
                >
                  <span
                    className={`w-2 h-2 rounded-full ${data.is_online ? "bg-green-500 animate-pulse" : "bg-muted-foreground"}`}
                  ></span>
                  {data.is_online ? "ONLINE" : "OFFLINE"}
                </span>
              )}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 bg-muted/50 hover:bg-muted rounded-full transition-colors"
          >
            <IconX size={20} />
          </button>
        </div>

        {/* Línea de tiempo (Timeline) */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {isLoading ? (
            <div className="animate-pulse space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-16 bg-muted/20 rounded-xl" />
              ))}
            </div>
          ) : data?.logs.length === 0 ? (
            <p className="text-center text-muted-foreground font-mono text-sm mt-10">
              No hay registros recientes.
            </p>
          ) : (
            <div className="relative border-l-2 border-border ml-3 space-y-8">
              {data?.logs.map((log) => (
                <div key={log.id} className="relative pl-6">
                  {/* Punto en la línea de tiempo */}
                  <div className="absolute -left-9px top-1 w-4 h-4 rounded-full bg-background border-2 border-(--accent-color)" />

                  <div className="bg-muted/10 border border-border p-3 rounded-lg shadow-sm">
                    <p className="text-xs font-bold uppercase tracking-widest text-(--accent-color) mb-1">
                      {log.action}
                    </p>
                    <p className="text-sm text-foreground mb-2">{log.details}</p>
                    <p className="text-[10px] text-muted-foreground font-mono flex items-center gap-1">
                      <IconClock size={12} /> {new Date(log.timestamp).toLocaleString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
