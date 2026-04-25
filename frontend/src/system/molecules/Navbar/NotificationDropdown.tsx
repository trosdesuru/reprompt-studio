"use client";

import { useState, useRef } from "react";
import { useNotificationStore } from "@/src/store/notificationStore";
import { useClickOutside } from "@/src/utils/hooks/useClickOutside";
import {
  IconInbox,
  IconCheck,
  IconTrash,
  IconInfoCircle,
  IconAlertTriangle,
} from "@tabler/icons-react";
import { Tooltip } from "../../atoms/Tooltip/Tooltip";

export function NotificationDropdown() {
  const { notifications, unreadCount, markAsRead, markAllAsRead, clearAll } =
    useNotificationStore();
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useClickOutside(menuRef, () => setIsOpen(false));

  const getIcon = (type: string) => {
    switch (type) {
      case "success":
        return <IconCheck size={16} className="text-green-500" />;
      case "error":
        return <IconAlertTriangle size={16} className="text-destructive" />;
      case "warning":
        return <IconAlertTriangle size={16} className="text-yellow-500" />;
      default:
        return <IconInfoCircle size={16} className="text-blue-500" />;
    }
  };

  return (
    <div className="relative" ref={menuRef}>
      <Tooltip content="Notificaciones" side="bottom">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="relative p-2 rounded-md transition-colors text-muted-foreground hover:text-foreground hover:bg-muted cursor-pointer"
        >
          {unreadCount > 0 ? (
            <IconInbox size={24} className="text-accent" />
          ) : (
            <IconInbox size={24} />
          )}

          {/* 🟢 BADGE: Usamos bg-destructive para el rojo del sistema */}
          {unreadCount > 0 && (
            <span className="absolute top-1 right-1 flex items-center justify-center min-w-4.5 h-4.5 p-1 bg-destructive text-white text-[10px] font-black font-mono rounded-full border-2 border-background">
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
          )}
        </button>
      </Tooltip>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-popover text-popover-foreground neo-border neo-shadow rounded-lg flex flex-col z-100 animate-in fade-in-0 zoom-in-95 origin-top-right overflow-hidden">
          {/* Header */}
          <div className="p-4 border-b border-border bg-primary flex justify-between items-center">
            <h3 className="text-sm text-secondary font-bold font-mono uppercase tracking-wide">
              Notificaciones
            </h3>
            <div className="flex gap-2">
              {unreadCount > 0 && (
                <button
                  onClick={markAllAsRead}
                  className="text-xs text-muted-foreground hover:text-foreground transition-colors"
                  title="Marcar todo como leído"
                >
                  <IconCheck size={16} />
                </button>
              )}
              {notifications.length > 0 && (
                <button
                  onClick={clearAll}
                  className="text-xs text-muted-foreground hover:text-destructive transition-colors"
                  title="Limpiar bandeja"
                >
                  <IconTrash size={16} />
                </button>
              )}
            </div>
          </div>

          {/* Lista de Mensajes */}
          <div className="max-h-96 overflow-y-auto custom-scrollbar flex flex-col">
            {notifications.length === 0 ? (
              <div className="p-8 text-center text-sm font-mono text-muted-foreground bg-background">
                Bandeja vacía.
              </div>
            ) : (
              notifications.map((n) => (
                <div
                  key={n.id}
                  onClick={() => markAsRead(n.id)}
                  // 🟢 ITEMS: Usamos bg-accent/10 para los no leídos y border-border/50
                  className={`p-4 border-b border-border/50 cursor-pointer transition-colors flex gap-3 ${
                    n.read ? "bg-background opacity-70" : "bg-accent/10 hover:bg-accent/20"
                  }`}
                >
                  <div className="mt-0.5 shrink-0">{getIcon(n.type)}</div>
                  <div className="flex flex-col gap-1 w-full min-w-0">
                    <div className="flex justify-between items-start gap-2">
                      <span
                        className={`text-xs font-bold font-mono uppercase truncate ${
                          !n.read ? "text-foreground" : "text-muted-foreground"
                        }`}
                      >
                        {n.title}
                      </span>
                      <span className="text-[9px] font-mono text-muted-foreground whitespace-nowrap">
                        {n.timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground leading-snug line-clamp-2">
                      {n.message}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
