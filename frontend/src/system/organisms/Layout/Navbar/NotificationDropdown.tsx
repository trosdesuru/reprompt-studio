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
        return <IconAlertTriangle size={16} className="text-red-500" />;
      case "warning":
        return <IconAlertTriangle size={16} className="text-yellow-500" />;
      default:
        return <IconInfoCircle size={16} className="text-blue-500" />;
    }
  };

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 rounded-md transition-colors text-muted-foreground hover:text-foreground hover:bg-(--bg-secondary) cursor-pointer"
      >
        {unreadCount > 0 ? (
          <IconInbox size={24} className="text-(--accent-color)" />
        ) : (
          <IconInbox size={24} />
        )}
        {unreadCount > 0 && (
          <span className="p-2 absolute top-1 right-1 flex items-center justify-center min-w-4.5 h-4.5 bg-red-500 text-white text-[10px] font-black font-mono rounded-full border-2 border-background">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-[#1A1B1E] border-2 border-(--border-color) shadow-[0_8px_30px_rgb(0,0,0,0.8)] rounded-lg flex flex-col z-100 animate-fade-in origin-top-right overflow-hidden">
          {/* Header */}
          <div className="p-4 border-b-2 border-(--border-color) bg-black/40 flex justify-between items-center">
            <h3 className="text-sm font-bold font-mono uppercase tracking-wide">Notificaciones</h3>
            <div className="flex gap-2">
              {unreadCount > 0 && (
                <button
                  onClick={markAllAsRead}
                  className="text-xs text-(--text-secondary) hover:text-foreground transition-colors"
                  title="Marcar todo como leído"
                >
                  <IconCheck size={16} />
                </button>
              )}
              {notifications.length > 0 && (
                <button
                  onClick={clearAll}
                  className="text-xs text-(--text-secondary) hover:text-red-500 transition-colors"
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
              <div className="p-8 text-center text-sm font-mono text-(--text-secondary)">
                Bandeja vacía.
              </div>
            ) : (
              notifications.map((n) => (
                <div
                  key={n.id}
                  onClick={() => markAsRead(n.id)}
                  className={`p-4 border-b border-(--border-color)/50 cursor-pointer transition-colors flex gap-3 ${n.read ? "bg-background opacity-70" : "bg-(--accent-color)/5"}`}
                >
                  <div className="mt-0.5">{getIcon(n.type)}</div>
                  <div className="flex flex-col gap-1 w-full">
                    <div className="flex justify-between items-start gap-2">
                      <span
                        className={`text-xs font-bold font-mono uppercase truncate ${!n.read ? "text-foreground" : "text-(--text-secondary)"}`}
                      >
                        {n.title}
                      </span>
                      <span className="text-[9px] text-(--text-secondary) whitespace-nowrap">
                        {n.timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                      </span>
                    </div>
                    <p className="text-xs text-(--text-secondary) leading-snug line-clamp-2">
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
