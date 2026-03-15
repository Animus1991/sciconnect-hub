import { createContext, useContext, useState, useCallback, ReactNode } from "react";
import { toast } from "sonner";

export interface AppNotification {
  id: string;
  type: "success" | "error" | "warning" | "info" | "blockchain";
  title: string;
  message?: string;
  timestamp: Date;
  read: boolean;
  txId?: string;
  blockchainStatus?: "pending" | "anchored" | "verified";
  blockchainNetwork?: string;
  explorerUrl?: string;
}

interface NotificationContextType {
  notifications: AppNotification[];
  unreadCount: number;
  addNotification: (type: AppNotification["type"], title: string, message?: string) => void;
  markRead: (id: string) => void;
  markAllRead: () => void;
  removeNotification: (id: string) => void;
  clearAll: () => void;
  // Convenience methods — show toast + persist to list
  success: (title: string, message?: string) => void;
  error: (title: string, message?: string) => void;
  warning: (title: string, message?: string) => void;
  info: (title: string, message?: string) => void;
}

const NotificationContext = createContext<NotificationContextType | null>(null);

const generateId = () => `n-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

export function NotificationProvider({ children }: { children: ReactNode }) {
  const [notifications, setNotifications] = useState<AppNotification[]>([]);

  const addNotification = useCallback((type: AppNotification["type"], title: string, message?: string) => {
    const notif: AppNotification = {
      id: generateId(),
      type,
      title,
      message,
      timestamp: new Date(),
      read: false,
    };
    setNotifications(prev => [notif, ...prev].slice(0, 50));

    // Also fire a sonner toast
    switch (type) {
      case "success": toast.success(title, { description: message }); break;
      case "error": toast.error(title, { description: message }); break;
      case "warning": toast.warning(title, { description: message }); break;
      case "info": toast.info(title, { description: message }); break;
    }
  }, []);

  const markRead = useCallback((id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  }, []);

  const markAllRead = useCallback(() => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  }, []);

  const removeNotification = useCallback((id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  }, []);

  const clearAll = useCallback(() => setNotifications([]), []);

  const success = useCallback((title: string, message?: string) => addNotification("success", title, message), [addNotification]);
  const error = useCallback((title: string, message?: string) => addNotification("error", title, message), [addNotification]);
  const warning = useCallback((title: string, message?: string) => addNotification("warning", title, message), [addNotification]);
  const info = useCallback((title: string, message?: string) => addNotification("info", title, message), [addNotification]);

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <NotificationContext.Provider value={{
      notifications, unreadCount, addNotification, markRead, markAllRead,
      removeNotification, clearAll, success, error, warning, info,
    }}>
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  const ctx = useContext(NotificationContext);
  if (!ctx) throw new Error("useNotifications must be used within NotificationProvider");
  return ctx;
}
