"use client";

import { useState, useRef } from "react";
import { useNotificationStore } from "@/src/store/notificationStore";
import { useClickOutside } from "@/src/utils/hooks/useClickOutside";
import { NotificationTrigger } from "@/src/system/atoms/Notification/NotificationTrigger";
import { NotificationPopover } from "./NotificationPopover";

export function NotificationDropdown() {
  const { notifications, unreadCount, markAsRead, markAllAsRead, clearAll } =
    useNotificationStore();

  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useClickOutside(menuRef, () => setIsOpen(false));

  return (
    <div className="relative" ref={menuRef}>
      <NotificationTrigger unreadCount={unreadCount} onClick={() => setIsOpen(!isOpen)} />

      {isOpen && (
        <NotificationPopover
          notifications={notifications}
          unreadCount={unreadCount}
          onMarkAllAsRead={markAllAsRead}
          onClearAll={clearAll}
          onMarkAsRead={markAsRead}
        />
      )}
    </div>
  );
}
