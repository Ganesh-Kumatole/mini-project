export type BudgetPeriod = 'monthly' | 'weekly' | 'yearly';
export type NotificationThreshold = 50 | 75 | 90; // percentages

export interface Budget {
  id: string;
  userId: string;
  category: string;
  limitAmount: number;
  period: BudgetPeriod;
  startDate: Date;
  endDate: Date;
  spentAmount: number; // NEW: denormalised current period spending
  notificationThreshold: NotificationThreshold; // NEW: e.g. 90 = notify at 90%
  notificationSent: boolean; // NEW: guard against spam
  lastNotificationDate?: Date; // NEW: timestamp of last notification
  createdAt: Date;
  updatedAt: Date;
}

// NEW: Notification tracking
export interface BudgetNotification {
  id: string;
  userId: string;
  budgetId: string;
  message: string;
  category: string;
  percentageUsed: number;
  spentAmount: number;
  limitAmount: number;
  read: boolean;
  createdAt: Date;
  dismissedAt?: Date;
}

// Helper to compute percentage
export function getBudgetPercentage(spent: number, limit: number): number {
  return limit > 0 ? Math.round((spent / limit) * 100) : 0;
}

// Helper to check if notification should be sent
export function shouldNotify(
  percentage: number,
  threshold: NotificationThreshold,
  notificationSent: boolean,
  lastNotificationDate?: Date,
): boolean {
  // Don't notify if already sent
  if (notificationSent) return false;

  // Don't notify more than once per 24 hours
  if (lastNotificationDate) {
    const hoursSinceLastNotification =
      (Date.now() - lastNotificationDate.getTime()) / (1000 * 60 * 60);
    if (hoursSinceLastNotification < 24) return false;
  }

  return percentage >= threshold;
}

export interface BudgetTracking {
  budgetId: string;
  spentAmount: number;
  periodStart: Date;
  periodEnd: Date;
  lastUpdated: Date;
}

export interface CreateBudgetInput {
  category: string;
  limitAmount: number;
  period: BudgetPeriod;
  startDate: Date;
  endDate: Date;
  notificationThreshold?: NotificationThreshold; // NEW
}

export interface UpdateBudgetInput extends Partial<CreateBudgetInput> {
  id: string;
  spentAmount?: number; // NEW
  notificationSent?: boolean; // NEW
  lastNotificationDate?: Date; // NEW
}
