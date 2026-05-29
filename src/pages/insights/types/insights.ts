export interface CategoryTotal {
  name: string;
  amount: number;
}

export interface BudgetHealth {
  id: string;
  category: string;
  spentAmount: number;
  limitAmount: number;
  percentUsed: number;
}

export interface MonthlyTrend {
  /** "YYYY-MM" label */
  month: string;
  income: number;
  expense: number;
}

export interface AnomalyTransaction {
  description: string;
  amount: number;
  category: string;
  date: Date;
  /** Number of standard deviations above the category average */
  sigmasAbove: number;
  categoryAvg: number;
}

export interface RecurringExpense {
  description: string;
  /** Normalized key used for matching */
  key: string;
  amount: number;
  category: string;
  /** How many months it appeared in */
  occurrences: number;
}

export interface ComputedInsights {
  currentIncome: number;
  currentExpense: number;
  savingsRate: number;
  monthOverMonthChange: number | null;
  topCategories: CategoryTotal[];
  budgetHealth: BudgetHealth[];
  budgetAlerts: BudgetHealth[];
  biggestExpense: { description: string; amount: number; category: string } | null;
  monthlyTrend: MonthlyTrend[];
  projectedMonthlySpend: number;
  daysElapsed: number;
  daysInMonth: number;
  anomalies: AnomalyTransaction[];
  weekdaySpend: number;
  weekendSpend: number;
  weekdayPct: number;
  weekendPct: number;
  recurringExpenses: RecurringExpense[];
  recurringTotal: number;
}
