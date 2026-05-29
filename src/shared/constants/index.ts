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
] as const;

export type TransactionCategory = (typeof TRANSACTION_CATEGORIES)[number];

export const ACCOUNT_TYPES = [
  'checking',
  'savings',
  'credit',
  'investment',
] as const;

export const BUDGET_PERIODS = ['monthly', 'yearly'] as const;

export const CURRENCY_KEY = 'fintracker_currency';
export const RATE_CACHE_KEY = 'fintracker_exchange_rate_cache';
export const RATE_CACHE_TTL_MS = 6 * 60 * 60 * 1000;
export const FALLBACK_RATE = 83.5;

// toast-type styles
export const STYLES = {
  success: {
    icon: 'check_circle',
    bar: 'bg-emerald-400',
    iconColor: 'text-emerald-400',
    ring: 'ring-emerald-500/20',
    glow: 'shadow-emerald-500/10',
  },
  error: {
    icon: 'error',
    bar: 'bg-red-400',
    iconColor: 'text-red-400',
    ring: 'ring-red-500/20',
    glow: 'shadow-red-500/10',
  },
  warning: {
    icon: 'warning',
    bar: 'bg-amber-400',
    iconColor: 'text-amber-400',
    ring: 'ring-amber-500/20',
    glow: 'shadow-amber-500/10',
  },
  info: {
    icon: 'info',
    bar: 'bg-blue-400',
    iconColor: 'text-blue-400',
    ring: 'ring-blue-500/20',
    glow: 'shadow-blue-500/10',
  },
};
