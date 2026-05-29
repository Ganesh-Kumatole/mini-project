export type NotificationType =
  | 'budget_exceeded'
  | 'budget_warning'
  | 'budget_info';

export interface Notification {
  id: string;
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  read: boolean;
  actionUrl?: string; // e.g. '/budgets'
  createdAt: Date;
  dismissedAt?: Date;
  metadata?: {
    budgetId?: string;
    category?: string;
    percentageUsed?: number;
  };
}

export interface CreateNotificationInput {
  type: NotificationType;
  title: string;
  message: string;
  actionUrl?: string;
  metadata?: Notification['metadata'];
}

export interface NotificationsContextType {
  notifications: Notification[];
  unreadCount: number;
  loading: boolean;
  createNotification: (input: CreateNotificationInput) => Promise<string>;
  markAsRead: (id: string) => Promise<void>;
  dismiss: (id: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
}
