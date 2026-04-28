export const TRANSACTION_CATEGORIES = [
  'Groceries',
  'Utilities',
  'Transport',
  'Entertainment',
  'Dining Out',
  'Rent',
  'Shopping',
  'Healthcare',
  'Education',
  'Income',
  'Other',
] as const

export type TransactionCategory = typeof TRANSACTION_CATEGORIES[number]

export const ACCOUNT_TYPES = ['checking', 'savings', 'credit', 'investment'] as const

export const BUDGET_PERIODS = ['monthly', 'yearly'] as const
