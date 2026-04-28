import { createContext, useContext, ReactNode } from 'react';
import { NotificationsContextType } from '@/types';
import useNotifications from '@/hooks/useNotifications';

// define context
const NotificationsContext = createContext<
  NotificationsContextType | undefined
>(undefined);

// context provider
const NotificationsProvider = ({ children }: { children: ReactNode }) => {
  const NotificationContextVal: NotificationsContextType = useNotifications();

  return (
    <NotificationsContext.Provider value={NotificationContextVal}>
      {children}
    </NotificationsContext.Provider>
  );
};

// context consumer
const useNotificationsContext = () => {
  const context = useContext(NotificationsContext);

  if (!context) {
    throw new Error(
      'useNotificationsContext must be used within NotificationsProvider',
    );
  }

  return context;
};

export { NotificationsProvider, useNotificationsContext };
