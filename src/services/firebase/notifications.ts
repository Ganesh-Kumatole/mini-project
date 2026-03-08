import {
  collection,
  addDoc,
  updateDoc,
  getDocs,
  query,
  where,
  orderBy,
  doc,
  Timestamp,
  onSnapshot,
  writeBatch,
} from 'firebase/firestore';
import { db } from './config';
import { Notification, CreateNotificationInput } from '@/types';

const getNotificationsCollection = (userId: string) => {
  return collection(db, 'users', userId, 'notifications');
};

// Create a notification
export const createNotification = async (
  userId: string,
  data: CreateNotificationInput,
): Promise<string> => {
  const docRef = await addDoc(getNotificationsCollection(userId), {
    ...data,
    read: false,
    createdAt: Timestamp.now(),
  });
  return docRef.id;
};

// Mark notification as read
export const markNotificationAsRead = async (
  userId: string,
  notificationId: string,
): Promise<void> => {
  const docRef = doc(db, 'users', userId, 'notifications', notificationId);
  await updateDoc(docRef, {
    read: true,
  });
};

// Dismiss (soft delete) notification
export const dismissNotification = async (
  userId: string,
  notificationId: string,
): Promise<void> => {
  const docRef = doc(db, 'users', userId, 'notifications', notificationId);
  await updateDoc(docRef, {
    dismissedAt: Timestamp.now(),
  });
};

// Get unread notifications
export const getUnreadNotifications = async (
  userId: string,
): Promise<Notification[]> => {
  const q = query(
    getNotificationsCollection(userId),
    where('read', '==', false),
    orderBy('createdAt', 'desc'),
  );
  const snapshot = await getDocs(q);
  const notifications = snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
    createdAt: doc.data().createdAt.toDate(),
    dismissedAt: doc.data().dismissedAt?.toDate(),
  })) as Notification[];
  return notifications.filter((n) => !n.dismissedAt);
};

// Subscribe to unread notifications
export const subscribeToUnreadNotifications = (
  userId: string,
  callback: (notifications: Notification[]) => void,
): (() => void) => {
  const q = query(
    getNotificationsCollection(userId),
    where('read', '==', false),
    orderBy('createdAt', 'desc'),
  );

  return onSnapshot(q, (snapshot) => {
    const notifications = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt.toDate(),
      dismissedAt: doc.data().dismissedAt?.toDate(),
    })) as Notification[];
    const filtered = notifications.filter((n) => !n.dismissedAt);
    callback(filtered);
  });
};

// Mark all as read
export const markAllNotificationsAsRead = async (
  userId: string,
): Promise<void> => {
  const q = query(
    getNotificationsCollection(userId),
    where('read', '==', false),
  );
  const snapshot = await getDocs(q);

  const batch = writeBatch(db);
  snapshot.docs.forEach((doc) => {
    batch.update(doc.ref, { read: true });
  });
  await batch.commit();
};

// Get notification count
export const getUnreadCount = async (userId: string): Promise<number> => {
  const q = query(
    getNotificationsCollection(userId),
    where('read', '==', false),
  );
  const snapshot = await getDocs(q);
  // Filter out dismissed notifications
  const count = snapshot.docs.filter((doc) => !doc.data().dismissedAt).length;
  return count;
};
