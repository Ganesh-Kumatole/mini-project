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
