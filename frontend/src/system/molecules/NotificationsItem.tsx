import { AppNotification } from "@/src/store/notificationStore";
import { IconCheck, IconAlertTriangle, IconInfoCircle } from "@tabler/icons-react";

export function NotificationItem({
  n,
  onRead,
}: {
  n: AppNotification;
  onRead: (id: string) => void;
}) {
  const icons = {
    success: <IconCheck size={16} className="text-green-500" />,
    error: <IconAlertTriangle size={16} className="text-red-500" />,
    warning: <IconAlertTriangle size={16} className="text-yellow-500" />,
    info: <IconInfoCircle size={16} className="text-blue-500" />,
  };

  return (
    <div
      onClick={() => onRead(n.id)}
      className={`p-4 border-b border-(--border-color)/50 cursor-pointer transition-colors flex gap-3 ${n.read ? "bg-background opacity-60" : "bg-(--accent-color)/5"}`}
    >
      <div className="mt-0.5">{icons[n.type]}</div>
      <div className="flex flex-col gap-1 w-full">
        <div className="flex justify-between items-start gap-2">
          <span
            className={`text-xs font-bold font-mono uppercase truncate ${!n.read ? "text-foreground" : "text-(--text-secondary)"}`}
          >
            {n.title}
          </span>
          <span className="text-[9px] text-(--text-secondary) whitespace-nowrap">
            {new Date(n.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
          </span>
        </div>
        <p className="text-xs text-(--text-secondary) leading-snug line-clamp-2">{n.message}</p>
      </div>
    </div>
  );
}
