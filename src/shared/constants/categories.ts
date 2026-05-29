// ── Centralized Transaction Category Definitions ──────────────────────────────
// Single source of truth for all category lists used across the app.

export const EXPENSE_CATEGORIES = [
  'Food & Dining',
  'Transportation',
  'Utilities',
  'Entertainment',
  'Healthcare',
  'Shopping',
  'Education',
  'Housing & Rent',
  'Personal Care',
  'Travel',
  'Subscriptions',
  'Fitness & Wellness',
  'Gifts & Donations',
  'Insurance',
  'Taxes & Fees',
  'Other',
] as const;

export const INCOME_CATEGORIES = [
  'Salary',
  'Freelance',
  'Business',
  'Investment Returns',
  'Rental Income',
  'Side Hustle',
  'Bonus',
  'Refund',
  'Gift Received',
  'Interest',
  'Dividends',
  'Other Income',
] as const;

export type ExpenseCategory = (typeof EXPENSE_CATEGORIES)[number];
export type IncomeCategory = (typeof INCOME_CATEGORIES)[number];
export type TransactionCategory = ExpenseCategory | IncomeCategory;

/** Returns the correct category list based on transaction type */
export const getCategoriesForType = (type: 'income' | 'expense'): readonly string[] =>
  type === 'income' ? INCOME_CATEGORIES : EXPENSE_CATEGORIES;
