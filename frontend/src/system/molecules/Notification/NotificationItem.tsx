import { IconCheck, IconAlertTriangle, IconInfoCircle } from "@tabler/icons-react";

interface NotificationItemProps {
  notification: any;
  onRead: () => void;
}

function getNotificationIcon(type: string) {
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
}

export function NotificationItem({ notification: n, onRead }: NotificationItemProps) {
  return (
    <div
      onClick={onRead}
      className={`p-4 border-b border-border/50 cursor-pointer transition-colors flex gap-3 ${
        n.read ? "bg-background opacity-70" : "bg-accent/10 hover:bg-accent/20"
      }`}
    >
      <div className="mt-0.5 shrink-0">{getNotificationIcon(n.type)}</div>
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
        <p className="text-xs text-muted-foreground leading-snug line-clamp-2">{n.message}</p>
      </div>
    </div>
  );
}
