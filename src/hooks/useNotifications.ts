import { useCallback, useEffect, useState } from 'react';
import { useAuth } from './useAuth';
import {
  createNotification as createNotificationSvc,
  markNotificationAsRead as markNotificationAsReadSvc,
  dismissNotification as dismissNotificationSvc,
  subscribeToUnreadNotifications,
  markAllNotificationsAsRead as markAllAsReadSvc,
} from '@/services/firebase/notifications';
import { Notification, CreateNotificationInput } from '@/types';

const useNotifications = () => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);

  // Subscribe to unread notifications
  useEffect(() => {
    if (!user) {
      setNotifications([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    const unsubscribe = subscribeToUnreadNotifications(
      user.uid,
      (notifications) => {
        setNotifications(notifications);
        setUnreadCount(notifications.length);
        setLoading(false);
      },
    );

    return () => unsubscribe();
  }, [user]);

  const createNotification = useCallback(
    async (input: CreateNotificationInput) => {
      if (!user) throw new Error('Not authenticated');
      return await createNotificationSvc(user.uid, input);
    },
    [user],
  );

  const markAsRead = useCallback(
    async (notificationId: string) => {
      if (!user) throw new Error('Not authenticated');
      return await markNotificationAsReadSvc(user.uid, notificationId);
    },
    [user],
  );

  const dismiss = useCallback(
    async (notificationId: string) => {
      if (!user) throw new Error('Not authenticated');
      return await dismissNotificationSvc(user.uid, notificationId);
    },
    [user],
  );

  const markAllAsRead = useCallback(async () => {
    if (!user) throw new Error('Not authenticated');
    return await markAllAsReadSvc(user.uid);
  }, [user]);

  return {
    notifications,
    unreadCount,
    loading,
    createNotification,
    markAsRead,
    dismiss,
    markAllAsRead,
  };
};

export default useNotifications;
