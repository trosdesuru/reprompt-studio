import { IconCheck, IconTrash } from "@tabler/icons-react";
import { NotificationItem } from "../../molecules/Notification/NotificationItem";

interface NotificationPopoverProps {
  notifications: any[];
  unreadCount: number;
  onMarkAllAsRead: () => void;
  onClearAll: () => void;
  onMarkAsRead: (id: string) => void;
}

export function NotificationPopover({
  notifications,
  unreadCount,
  onMarkAllAsRead,
  onClearAll,
  onMarkAsRead,
}: NotificationPopoverProps) {
  return (
    <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-popover text-popover-foreground neo-border neo-shadow rounded-lg flex flex-col z-100 animate-in fade-in-0 zoom-in-95 origin-top-right overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b border-border bg-muted/30 flex justify-between items-center">
        <h3 className="text-sm font-bold font-mono uppercase tracking-wide">Notificaciones</h3>
        <div className="flex gap-2">
          {unreadCount > 0 && (
            <button
              onClick={onMarkAllAsRead}
              className="text-xs text-muted-foreground hover:text-foreground transition-colors"
              title="Marcar todo como leído"
            >
              <IconCheck size={16} />
            </button>
          )}
          {notifications.length > 0 && (
            <button
              onClick={onClearAll}
              className="text-xs text-muted-foreground hover:text-destructive transition-colors"
              title="Limpiar bandeja"
            >
              <IconTrash size={16} />
            </button>
          )}
        </div>
      </div>

      <div className="max-h-96 overflow-y-auto custom-scrollbar flex flex-col">
        {notifications.length === 0 ? (
          <div className="p-8 text-center text-sm font-mono text-muted-foreground">
            Bandeja vacía.
          </div>
        ) : (
          notifications.map((n) => (
            <NotificationItem key={n.id} notification={n} onRead={() => onMarkAsRead(n.id)} />
          ))
        )}
      </div>
    </div>
  );
}
