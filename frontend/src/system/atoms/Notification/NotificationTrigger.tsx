import { IconInbox } from "@tabler/icons-react";

interface NotificationTriggerProps {
  unreadCount: number;
  onClick: () => void;
}

export function NotificationTrigger({ unreadCount, onClick }: NotificationTriggerProps) {
  return (
    <button
      onClick={onClick}
      className="relative p-2 rounded-md transition-colors text-muted-foreground hover:text-foreground hover:bg-muted cursor-pointer"
    >
      <IconInbox size={24} className={unreadCount > 0 ? "text-accent" : ""} />

      {unreadCount > 0 && (
        <span className="absolute top-1 right-1 flex items-center justify-center min-w-4.5 h-4.5 p-1 bg-destructive text-white text-[10px] font-black font-mono rounded-full border-2 border-background">
          {unreadCount > 9 ? "9+" : unreadCount}
        </span>
      )}
    </button>
  );
}
