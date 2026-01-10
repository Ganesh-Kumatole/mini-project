import { Transaction, TransactionType } from '@/types'

export const calculateTotalBalance = (
  transactions: Transaction[],
  initialBalance: number = 0
): number => {
  return transactions.reduce((total, transaction) => {
    if (transaction.type === 'income') {
      return total + transaction.amount
    } else {
      return total - transaction.amount
    }
  }, initialBalance)
}

export const calculateTotalIncome = (transactions: Transaction[]): number => {
  return transactions
    .filter((t) => t.type === 'income')
    .reduce((total, t) => total + t.amount, 0)
}

export const calculateTotalExpenses = (transactions: Transaction[]): number => {
  return transactions
    .filter((t) => t.type === 'expense')
    .reduce((total, t) => total + t.amount, 0)
}

export const calculateCategoryTotals = (
  transactions: Transaction[]
): Record<string, number> => {
  return transactions.reduce((totals, transaction) => {
    const category = transaction.category
    totals[category] = (totals[category] || 0) + transaction.amount
    return totals
  }, {} as Record<string, number>)
}

export const calculateBudgetUsage = (
  spent: number,
  limit: number
): { percentage: number; remaining: number } => {
  const percentage = Math.min((spent / limit) * 100, 100)
  const remaining = Math.max(limit - spent, 0)
  return { percentage, remaining }
}
