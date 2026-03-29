import { create } from "zustand";
import toast from "react-hot-toast";

export type NotificationType = "success" | "error" | "info" | "warning";

export interface AppNotification {
  id: string;
  title: string;
  message: string;
  type: NotificationType;
  read: boolean;
  timestamp: Date;
}

interface NotificationState {
  notifications: AppNotification[];
  unreadCount: number;
  // Acciones
  notify: (title: string, message: string, type?: NotificationType) => void;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  clearAll: () => void;
}

export const useNotificationStore = create<NotificationState>((set) => ({
  notifications: [],
  unreadCount: 0,

  notify: (title, message, type = "info") => {
    const id = crypto.randomUUID();
    const newNotif: AppNotification = {
      id,
      title,
      message,
      type,
      read: false,
      timestamp: new Date(),
    };

    // 1. Actualizamos el estado de la bandeja y el contador
    set((state) => ({
      notifications: [newNotif, ...state.notifications].slice(0, 50), // Guardamos máximo 50
      unreadCount: state.unreadCount + 1,
    }));

    const toastMessage = `${title}: ${message}`;

    switch (type) {
      case "success":
        toast.success(toastMessage, { id });
        break;
      case "error":
        toast.error(toastMessage, { id });
        break;
      case "warning":
        // Usamos el custom que definimos en AppToaster para el warning
        toast(toastMessage, { id, icon: "⚠️" });
        break;
      case "info":
      default:
        toast(toastMessage, { id, icon: "ℹ️" });
        break;
    }
  },

  markAsRead: (id) =>
    set((state) => {
      const notifs = state.notifications.map((n) => (n.id === id ? { ...n, read: true } : n));
      return {
        notifications: notifs,
        unreadCount: notifs.filter((n) => !n.read).length,
      };
    }),

  markAllAsRead: () =>
    set((state) => ({
      notifications: state.notifications.map((n) => ({ ...n, read: true })),
      unreadCount: 0,
    })),

  clearAll: () => set({ notifications: [], unreadCount: 0 }),
}));
