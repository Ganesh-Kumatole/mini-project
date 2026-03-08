import React, { createContext, useContext } from 'react';
import { useNotifications } from '@/hooks';
import { Notification, CreateNotificationInput } from '@/types';

interface NotificationsContextType {
  notifications: Notification[];
  unreadCount: number;
  loading: boolean;
  createNotification: (input: CreateNotificationInput) => Promise<string>;
  markAsRead: (id: string) => Promise<void>;
  dismiss: (id: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
}

const NotificationsContext = createContext<
  NotificationsContextType | undefined
>(undefined);

export const NotificationsProvider: React.FC<{
  children: React.ReactNode;
}> = ({ children }) => {
  const notificationsHook = useNotifications();

  return (
    <NotificationsContext.Provider value={notificationsHook}>
      {children}
    </NotificationsContext.Provider>
  );
};

export const useNotificationsContext = () => {
  const context = useContext(NotificationsContext);
  if (!context) {
    throw new Error(
      'useNotificationsContext must be used within NotificationsProvider',
    );
  }
  return context;
};
