import { useMemo } from 'react';
import { useTransactions } from './useTransactions';
import { useBudgets } from './useBudgets';

type MonthlyTotals = {
  month: string; // YYYY-MM
  income: number;
  expense: number;
  net: number;
};

export const useDashboard = (months = 6) => {
  const { transactions, loading: loadingT } = useTransactions();
  const { budgets, loading: loadingB } = useBudgets();

  const loading = loadingT || loadingB;

  const totals = useMemo(() => {
    const totalIncome = transactions
      .filter((t) => t.type === 'income')
      .reduce((s, t) => s + t.amount, 0);

    const totalExpense = transactions
      .filter((t) => t.type === 'expense')
      .reduce((s, t) => s + t.amount, 0);

    const balance = totalIncome - totalExpense;

    return {
      totalIncome,
      totalExpense,
      balance,
    };
  }, [transactions]);

  const monthly = useMemo<MonthlyTotals[]>(() => {
    const byMonth = new Map<string, { income: number; expense: number }>();

    const keyFor = (d: Date) => {
      const y = d.getFullYear();
      const m = d.getMonth() + 1;
      return `${y}-${m.toString().padStart(2, '0')}`;
    };

    transactions.forEach((t) => {
      const key = keyFor(new Date(t.date));
      const prev = byMonth.get(key) ?? { income: 0, expense: 0 };
      if (t.type === 'income') prev.income += t.amount;
      else prev.expense += t.amount;
      byMonth.set(key, prev);
    });

    // build last `months` keys (most recent first)
    const now = new Date();
    const result: MonthlyTotals[] = [];
    for (let i = 0; i < months; i++) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const key = keyFor(d);
      const entry = byMonth.get(key) ?? { income: 0, expense: 0 };
      result.push({
        month: key,
        income: entry.income,
        expense: entry.expense,
        net: entry.income - entry.expense,
      });
    }

    return result.reverse();
  }, [transactions, months]);

  return {
    transactions,
    budgets,
    loading,
    totals,
    monthly,
  };
};

export default useDashboard;
